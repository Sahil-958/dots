#!/bin/bash

# Removed Azure resources: 
# The Microsoft Vision API key and endpoint have been removed. 
# Please replace the following variables with your own:
MICROSOFT_VISION_API_KEY='22d12becea494ddb8e3a8544cb858b50'
MICROSOFT_VISION_API_ENDPOINT='https://basher.cognitiveservices.azure.com'

# Maximum number of parallel processes
MAX_PARALLEL_JOBS=3

ALLOWED_IMAGE_EXTENSIONS=('jpeg' 'jpg' 'png')
logs=$(mktemp)

rename_img() {
    local old="$1"
    local new="$2"
    local base_dir=$(dirname $old)
    local ext=${old##*.}
    local new_name="$new.$ext"
    local counter=1
    if [ "$base_dir/$new_name" = "$old" ]; then
        echo -e "   Old name:[$(basename $old)] == new name:[$new_name] Skipped"
        return 1
    fi
    while [ -e "$base_dir/$new_name" ]; do
        if [ $counter -lt 10 ]; then
            padded_counter="0$counter"  # Add padding for single-digit numbers
        else
            padded_counter="$counter"
        fi
        new_name="${new}_$padded_counter.$ext"
        counter=$((counter + 1))
    done

    mv "$old" "$base_dir/$new_name"
    echo "Renaming $old to $new_name"
}

get_caption() {
    local image_file="$1"
    local request_url="$MICROSOFT_VISION_API_ENDPOINT/vision/v3.2/describe?maxCandidates=1&language=en&model-version=latest"
    local headers="Content-Type: application/octet-stream"
    local response=$(curl -s -X POST -H "Ocp-Apim-Subscription-Key: $MICROSOFT_VISION_API_KEY" -H "$headers" --data-binary @"$image_file" "$request_url")
    local caption_text=$(echo "$response" | jq -r '.description.captions[0].text')
    echo "$caption_text"
}


process_image() {
    local caption=$(get_caption "$1")
    local result=$(rename_img "$1" "$caption")
    echo "$result" >> $logs
}

init() {
    echo "Max Parallel Jobs is: $MAX_PARALLEL_JOBS"
    local directory="$1"
    if [ -d "$directory" ]; then
        IFS=$'\n'
        local images=()
        readarray -t images < <(find "$directory" -type f -regex ".*\.\(jpg\|jpeg\|png\)")
        local count=0
        for image in "${images[@]}"; do
            if [ "$count" -lt "$MAX_PARALLEL_JOBS" ]; then
                ((count++))
                echo "Processing image - $image"
                process_image "$image" &
            else
                echo "Maximum parallel jobs reached. Waiting for a free slot to process image - $image"
                wait -n
                ((count--))
                echo "Processing image - $image"
                process_image "$image" &
                ((count++))
            fi
        done
        wait
        echo "Logs:"
        echo "_______________________________________________________"
        cat $logs
        echo "_______________________________________________________"
        rm $logs
    else
        echo "Directory not found: $directory"
    fi
}


usage() {
    echo "Usage: $0 [options] <image1 dir>"
    echo "Options:"
    echo "  -h Prints this useage"
    echo "  -key API key for vision api ex: '22d12becea494ddb8e3a8544cb858b50'"
    echo "  -kf Same as the -key flag but uses file as input for api key (To hide the key in screen recording scenarios)"
    echo "  -endpoint Url of the vision api endpoint ex: 'https://basher.cognitiveservices.azure.com'"
    echo "  -p Set Concurrency Level How many image to process parallely (default: 3)"
    echo "Example:"
    echo "$0 -p 5 ~/walls/"
   exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
       -p)
            shift
            MAX_PARALLEL_JOBS=$1
            ;;
       -kf)
            shift
            MICROSOFT_VISION_API_KEY=$(cat $1)
            ;;
       -key)
            shift
            MICROSOFT_VISION_API_KEY="$1"
            ;;
       -endpoint)
            shift
            MICROSOFT_VISION_API_ENDPOINT="$1"
            ;;
       -h)
            usage
            ;;
       -*)
            echo "Unrecognized option: $1" >&2
            usage
            ;;
       *)
            dir="$1"
            ;;
    esac
    shift
done
init "$dir"
