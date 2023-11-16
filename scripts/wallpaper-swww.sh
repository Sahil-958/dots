#!/bin/bash
# __        __    _ _                              
# \ \      / /_ _| | |_ __   __ _ _ __   ___ _ __  
#  \ \ /\ / / _` | | | '_ \ / _` | '_ \ / _ \ '__| 
#   \ V  V / (_| | | | |_) | (_| | |_) |  __/ |    
#    \_/\_/ \__,_|_|_| .__/ \__,_| .__/ \___|_|    
#                    |_|         |_|               
#  
# ----------------------------------------------------- 

# ----------------------------------------------------- 
# Select wallpaper
# ----------------------------------------------------- 
selected=$(ls -1 ~/walls | rofi -dmenu -config ~/dots/rofi/config.rasi)

if [ "$selected" ]; then

    echo "Changing theme..."
    # ----------------------------------------------------- 
    # Update wallpaper with pywal
    # ----------------------------------------------------- 
    wal -q -i ~/walls/$selected

    # ----------------------------------------------------- 
    # Get new theme
    # ----------------------------------------------------- 
    source "$HOME/.cache/wal/colors.sh"
    # ----------------------------------------------------- 
    # Copy selected wallpaper into .cache folder
    # ----------------------------------------------------- 
    extension="${selected##*.}"
    cp $wallpaper ~/.cache/current_wallpaper.${extension}   

    newwall=$(echo $wallpaper | sed "s|$HOME/walls/||g")

    # ----------------------------------------------------- 
    # Set the new wallpaper
    # ----------------------------------------------------- 
    swww img $wallpaper \
        --transition-bezier .45,.65,.65,.35\
        --transition-fps=60 \
	--transition-step 255\
        --transition-type="random" \
        --transition-duration=0.7 \

	
    ~/dots/waybar/launch.sh

    sleep 1

    # ----------------------------------------------------- 
    # Send notification
    # ----------------------------------------------------- 
    notify-send "Colors and Wallpaper updated" "with image $newwall"


    echo "Done."
fi
