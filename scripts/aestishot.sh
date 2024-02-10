#!/bin/bash

usage() {
    echo "Usage: $0 [options] <image1> <image2> ... -r <angle>"
    echo "Options:"
    echo "  -p <padding>     Padding size for the gradient background (default: 80)"
    echo "  -r <radius>      Corner radius for the output image (default: 20)"
    echo "  -a <angle>       Angle to rotate the output image by (default: 9)"
    exit 1
}

images=()
padding=80
radius=20
angle=9
output="output"
type="png"
while [[ $# -gt 0 ]]; do
    case $1 in
       -p)
            shift
            padding=$1
            ;;
        -r)
            shift
            radius=$1
            ;;
        -t)
            shift
            type=$1
            ;;
        -o)
            shift
            output=$1
            ;;
        -a)
            shift
            angle=$1
            ;;
        -*)
            echo "Unrecognized option: $1" >&2
            usage
            ;;
        *)
            images+=("$1")
            ;;
    esac
    shift
done

if [ ${#images[@]} -eq 0 ]; then
    echo "No images provided."
    usage
fi

echo "Hang tight this may take some time"
# Calculate the height of each cropped part
num_images=${#images[@]}

# Create temporary files for parts
parts=()
for ((i = 0; i < $(($num_images + 2)); i++)); do
    parts+=( "$(mktemp /tmp/part_$i.XXXXXX.$type)" )
done

echo -n "Rotating and merging | Status: "
# Crop the parts using the calculated positions
for ((i = 0; i < num_images; i++)); do
    {
    convert  "${images[i]}" -background none -rotate "$angle" -trim +repage $type:"${parts[i]}"
    # Calculate the dimensions of the first image
    read image_width image_height posx posy <<< $(identify -format "%w %h %[fx:page.x] %[fx:page.y]" "${parts[i]}")
    crop_height=$((image_height / $num_images ))

    position=$((crop_height * i))
    new_posy=$((posy + position))
    convert  "${parts[i]}" -crop "${image_width}x${crop_height}+${posx}+${new_posy}" $type:"${parts[i]}"
    } &
done

# Wait for all background jobs to finish
wait

# Combine the parts vertically and save as "$output".$type
convert  "${parts[@]::${#parts[@]}-2}" -append "$output".$type

if [[ "$angle" == -* ]]; then
    # If it starts with "-", replace it with "+"
    angle="${angle/-/}"
else
    # If it doesn't start with "-", prepend it with "-"
    angle="-${angle}"
fi

convert  "$output".$type -background none -rotate "$angle" -trim +repage $type:"$output".$type

echo "Done"

read W H <<< $(identify -format "%w %h" ""$output".$type")
 
if [[ "$radius" -ne 0 ]]; then
    echo -n "Rounding Inner Image | Status: "
    convert  -size "${W}x${H}" xc:none -draw "roundrectangle 0,0,$W,$H,$radius,$radius" $type:"${parts[-2]}"
    convert  "$output".$type -matte "${parts[-2]}" -compose DstIn -composite "$output".$type

    echo "Done"
else
    echo "Radius:$radius Skipping Rounding"
fi

if [[ "$padding" -ne 0 ]]; then
    echo -n "Adding gradient padding "
    fromColor=$(convert "${images[0]}" -alpha off -resize 1x1 -format "#%[hex:u]" info:-)
    toColor=$(convert "${images[-1]}" -alpha off -resize 1x1 -format "#%[hex:u]" info:-)

    echo -n "with Colors $fromColor $toColor | Status: "
   magick -size $(( W + padding ))x$(( H + padding ))  -define gradient:angle=$(( 180 - $angle )) gradient:"$fromColor-$toColor" $type:"${parts[-1]}"

    composite -gravity center "$output".$type "${parts[-1]}"  "$output".$type
    echo "Done"
else
    echo "Padding:$padding Skipping Padding"
fi
# Clean up temporary files
echo -n "Cleaning Up temporary files | Status: "
rm "${parts[@]}"
echo "Done"
echo "Check out the "$output".$type"
