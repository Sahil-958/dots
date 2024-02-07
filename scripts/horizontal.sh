#!/bin/bash

# Create temporary files for parts
parts=()
for ((i = 0; i < $#; i++)); do
    parts+=( "$(mktemp /tmp/part_$i.XXXXXX.png)" )
done

# Calculate the dimensions of the first image
image_width=$(identify -format "%w" "$1")
image_height=$(identify -format "%h" "$1")

# Calculate the height of each cropped part
num_parts=$#
crop_height=$((image_height / num_parts))

# Crop the parts using the calculated positions
for ((i = 0; i < $#; i++)); do
    position=$((crop_height * i))
    file_index=$((i + 1))
    convert "${!file_index}" -crop "${image_width}x${crop_height}+0+${position}" png:"${parts[i]}"
done

# Combine the parts vertically and save as output.png
convert "${parts[@]}" -append output.png

# Clean up temporary files
rm "${parts[@]}"

