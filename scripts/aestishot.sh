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

# Calculate the height of each cropped part
num_images=${#images[@]}

# Create temporary files for parts
parts=()
for ((i = 0; i < $(($num_images + 2)); i++)); do
    parts+=( "$(mktemp /tmp/part_$i.XXXXXX.png)" )
done

# Crop the parts using the calculated positions
for ((i = 0; i < num_images; i++)); do
    convert "${images[i]}" -background none -rotate "$angle" -trim +repage png:"${parts[i]}"
    # Calculate the dimensions of the first image
    image_width=$(identify -format "%w" "${parts[i]}")
    image_height=$(identify -format "%h" "${parts[i]}")
    posx=$(identify -format "%[fx:page.x]" "${parts[i]}")
    posy=$(identify -format "%[fx:page.y]" "${parts[i]}")
    crop_height=$((image_height / $num_images ))

    position=$((crop_height * i))
    new_posy=$((posy + position))
    convert "${parts[i]}" -crop "${image_width}x${crop_height}+${posx}+${new_posy}" png:"${parts[i]}"

done

# Combine the parts vertically and save as output.png
convert "${parts[@]::${#parts[@]}-2}" -append output.png

if [[ -n "$angle" ]]; then
    if [[ "$angle" == -* ]]; then
        # If it starts with "-", replace it with "+"
        angle="${angle/-/}"
    else
        # If it doesn't start with "-", prepend it with "-"
        angle="-${angle}"
    fi

    convert output.png -background none -rotate "$angle" -trim +repage png:output.png
fi

fromColor=$(convert "${images[0]}" -alpha off -resize 1x1 -format "#%[hex:u]" info:-)
toColor=$(convert "${images[-1]}" -alpha off -resize 1x1 -format "#%[hex:u]" info:-)

echo "$fromColor $toColor"
W=$(identify -format "%w" "output.png")
H=$(identify -format "%h" "output.png")
if [[ -n "$angle" ]]; then
    magick -size $(( W + padding ))x$(( H + padding ))  -define gradient:angle=$(( 180 - $angle )) gradient:"$fromColor-$toColor" png:"${parts[-1]}"

    convert -size "${W}x${H}" xc:none -draw "roundrectangle 0,0,$W,$H,$radius,$radius" "${parts[-2]}"
    convert output.png -matte "${parts[-2]}" -compose DstIn -composite output.png

    composite -gravity center output.png "${parts[-1]}"  output.png
fi

# Clean up temporary files
rm "${parts[@]}"

