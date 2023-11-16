#!/bin/bash


notify-send "Setting Random Wallpaper "
# ----------------------------------------------------- 
# Select random wallpaper and create color scheme
# ----------------------------------------------------- 
wal -q -i ~/walls/

# ----------------------------------------------------- 
# Load current pywal color scheme
# ----------------------------------------------------- 
source "$HOME/.cache/wal/colors.sh"

# ----------------------------------------------------- 
# Copy selected wallpaper into .cache folder
# ----------------------------------------------------- 
cp $wallpaper ~/.cache/current_wallpaper.*

# ----------------------------------------------------- 
# get wallpaper iamge name
# ----------------------------------------------------- 
newwall=$(echo $wallpaper | sed "s|$HOME/walls/||g")

# ----------------------------------------------------- 
# Set the new wallpaper
# ----------------------------------------------------- 
swww img $wallpaper \
    --transition-bezier .45,.65,.65,.35\
    --transition-fps=40 \
    --transition-type="random" \
    --transition-duration=0.75 \
    --transition-step 255\

~/dots/waybar/launch.sh
sleep 1

# ----------------------------------------------------- 
# Send notification
# ----------------------------------------------------- 
notify-send "Colors and Wallpaper updated" "with image $newwall"

echo "DONE!"
