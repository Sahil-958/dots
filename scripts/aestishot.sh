#!/bin/bash

help_message="Imagemagik is required for this scirpt to work
Usage: $(basename "$0") path/to/image1.png ... path/to/imageN.png <angle of join>

For Example: 
    let current dir contains: img1.png img2.png img3.png
    then you can use it as:
    $(basename "$0") img1.png img2.png img3.png 10

This will create an output.png in your current dir which contains all images combined at angle 10
The <angle> at last is nessary if you want only horizontal join pass 0
For Padding and gradient color edit the script
"

display_help() {
    echo "$help_message"
}

# Check if -h option is passed
if [[ "$1" == "-h" ]]; then
    display_help
    exit 0
fi

# Calculate the height of each cropped part
images=$(($# - 1))

# Create temporary files for parts
parts=()
for ((i = 0; i <= $#; i++)); do
    parts+=( "$(mktemp /tmp/part_$i.XXXXXX.png)" )
done


# Crop the parts using the calculated positions
for ((i = 0; i < $images; i++)); do
    file_index=$((i + 1))
    convert "${!file_index}" -background none -rotate ${!#} -trim +repage png:"${parts[i]}"
    # Calculate the dimensions of the first image
    image_width=$(identify -format "%w" "${parts[i]}")
    image_height=$(identify -format "%h" "${parts[i]}")
    posx=$(identify -format "%[fx:page.x]" "${parts[i]}")
    posy=$(identify -format "%[fx:page.y]" "${parts[i]}")
    crop_height=$((image_height / images))

    position=$((crop_height * i))
    new_posy=$((posy + position))
    convert "${parts[i]}" -crop "${image_width}x${crop_height}+${posx}+${new_posy}" png:"${parts[i]}"

done

# Combine the parts vertically and save as output.png
convert "${parts[@]::${#parts[@]}-2}" -append output.png

if [[ "${!#}" == -* ]]; then
    # If it starts with "-", replace it with "+"
    angle="${!#/-/}"
else
    # If it doesn't start with "-", prepend it with "-"
    angle="-${!#}"
fi

convert output.png -background none -rotate $angle -trim +repage png:output.png

fromColor=$(convert "$1" -alpha off -resize 1x1 -format "#%[hex:u]" info:-)
toColor=$(convert "${@: -2:1}" -alpha off -resize 1x1 -format "#%[hex:u]" info:-)

echo "$fromColor $toColor"
W=$(identify -format "%w" "output.png")
H=$(identify -format "%h" "output.png")
magick -size $(( $W + 90 ))x$(( $H + 90 ))  -define gradient:angle=$(( 180 - ${!#} )) gradient:"$fromColor-$toColor" png:"${parts[-1]}"

convert -size "$W"x"$H" xc:none -draw "roundrectangle 0,0,$W,$H,20,20" "${parts[-2]}"
convert output.png -matte "${parts[-2]}" -compose DstIn -composite output.png

composite -gravity center output.png "${parts[-1]}"  output.png

# Clean up temporary files
rm "${parts[@]}"
