#!/bin/bash

# Create temporary files for parts
parts=()
for ((i = 0; i < $#; i++)); do
    parts+=( "$(mktemp /tmp/part_$i.XXXXXX.png)" )
done

# Calculate the width of each image
image_width=$(identify -format "%w" "$1")
image_height=$(identify -format "%h" "$1")

# Calculate the width of each cropped part
num_parts=$#
crop_width=$((image_width / num_parts))

# Crop the parts using the calculated positions
for ((i = 0; i < $#; i++)); do
    position=$((crop_width * i))
    file_index=$((i + 1))
    convert "${!file_index}" -crop "${crop_width}x${image_height}+${position}+0" png:"${parts[i]}"
done

# Combine the parts horizontally and save as output.png
convert "${parts[@]}" +append output.png

# Clean up temporary files
rm "${parts[@]}"

