#!/bin/bash

# Calculate the height of each cropped part
images=$(($# - 1))


# Create temporary files for parts
parts=()
for ((i = 0; i < $images; i++)); do
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
convert "${parts[@]}" -append output.png

if [[ "${!#}" == -* ]]; then
    # If it starts with "-", replace it with "+"
    angle="${!#/-/}"
else
    # If it doesn't start with "-", prepend it with "-"
    angle="-${!#}"
fi
convert output.png -background none -rotate $angle -trim +repage png:output.png
# Clean up temporary files
rm "${parts[@]}"

