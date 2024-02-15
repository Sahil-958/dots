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
    local old_name=$(basename $old)
    local new="$2"
    local base_dir=$(dirname $old)
    local ext=${old##*.}
    local new_name="$new.$ext"
    local counter=1
    if [ "$base_dir/$new_name" = "$old" ]; then
        echo -e "   Old name:[$old_name] == new name:[$new_name] Skipped"
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
    echo "Renaming [$old_name] to [$new_name]"
}

get_caption() {
    local image_file="$1"
    local api_version="${2:-v4.0_caption}"  # Default to v4.0_caption if no version is provided
    
    case $api_version in
        "v3.2")
            local request_url="$MICROSOFT_VISION_API_ENDPOINT/vision/v3.2/describe?maxCandidates=1&language=en&model-version=latest"
            local filter=".description.captions[0].text"
            ;;
        "v4.0_caption")
            local request_url="$MICROSOFT_VISION_API_ENDPOINT/computervision/imageanalysis:analyze?api-version=2023-10-01&features=caption&model-version=latest&language=en"
            local filter=".captionResult.text"
            ;;
        "v4.0_denseCaptions")
            local request_url="$MICROSOFT_VISION_API_ENDPOINT/computervision/imageanalysis:analyze?api-version=2023-10-01&features=denseCaptions&model-version=latest&language=en"
            local filter=".denseCaptionsResult.values[0].text"
            ;;
        *)
            echo "Invalid API version. Please specify either 'v3.2', 'v4.0_caption', or 'v4.0_denseCaptions'."
            exit 1
            ;;
    esac
    
    local response=$(curl -s -X POST -H "Ocp-Apim-Subscription-Key: $MICROSOFT_VISION_API_KEY" -H "Content-Type: application/octet-stream" --data-binary @"$image_file" "$request_url")
    local caption_text=$( echo "$response" | jq -r "$filter")
   
    if [[ -n "$response_file" ]]; then
        echo "$response" >> "$response_file"
    fi 

    if [[ -n "$space_replacement" ]]; then
    caption_text="${caption_text// /$space_replacement}"        
    fi 
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
    echo "  -r Accpets a file name to save the responses from api"
    echo "  -sr By default names have spaces in them so use -sr flag to send a space replacement like _ or -"
    echo "Example:"
    echo "$0 -p 5 -sr _ -r responses.txt -kf api_key.txt -endpoint \"https://basher.cognitiveservices.azure.com\" ~/Pictures/"
   exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
       -p)
            shift
            MAX_PARALLEL_JOBS=$1
            ;;
       -sr)
            shift
            space_replacement="$1"
            ;;
       -r)
            shift
            response_file=$1
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
