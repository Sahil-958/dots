#!/bin/bash
#                _ _                              
# __      ____ _| | |_ __   __ _ _ __   ___ _ __  
# \ \ /\ / / _` | | | '_ \ / _` | '_ \ / _ \ '__| 
#  \ V  V / (_| | | | |_) | (_| | |_) |  __/ |    
#   \_/\_/ \__,_|_|_| .__/ \__,_| .__/ \___|_|    
#                   |_|         |_|               
#  
# ----------------------------------------------------- 
isFromCache=false
 
case $1 in

    # Load wallpaper from .cache of last session 
    "init")
        if [ -f ~/.cache/current_wall_path.txt ]; then
	    path=$(cat ~/.cache/current_wall_path.txt)
	    wal -q -i $path
	    isFromCache=true
        else
	    wallpath=$(find ~/walls/ -type f -regex ".*\.\(jpg\|jpeg\|png\|gif\|bmp\)" | shuf -n 1)
            wal -q -i $wallpath
        fi
    ;;

    # Select wallpaper with rofi
    "select")
    selected=$( find "$HOME/walls/" -type f -regex ".*\.\(jpg\|jpeg\|png\|gif\|bmp\)" | sort -R | while read rfile 
    do
        basename=$(basename $rfile)
        echo -en "$basename\x00icon\x1f/${rfile}\n"
    done | rofi -dmenu -replace -config ~/dots/rofi/config-hyprdots.rasi)

        
#    selected=$( find ~/walls/ -type f -regex ".*\.\(jpg\|jpeg\|png\|gif\|bmp\)" -printf "%f\n"| rofi -dmenu -replace -config ~/dots/rofi/config-wallpaper.rasi)
        if [ ! "$selected" ]; then
            echo "No wallpaper selected"
            exit
        fi
	wallpath=$(find ~/walls/ -type f -name $selected)
	wal -q -i $wallpath  
    ;;
    
    # Randomly select Remote wallpaper 
    remote)
        notify-send "selecting Remote wallpaper randomly"
        wallpath="$(~/dots/hypr/scripts/remote_wall.sh)"
        wal -q -i $wallpath
    ;;

    # Randomly select wallpaper 
    *)
        notify-send "selecting wallpaper randomly"
	    wallpath=$(find ~/walls/ -type f -regex ".*\.\(jpg\|jpeg\|png\|gif\|bmp\)" | shuf -n 1)
            wal -q -i $wallpath
    ;;

esac

# ----------------------------------------------------- 
# Load current pywal color scheme
# ----------------------------------------------------- 

source "$HOME/.cache/wal/colors.sh"
echo "Wallpaper: $wallpaper"

# ----------------------------------------------------- 
# Copy selected wallpaper into .cache folder
# ----------------------------------------------------- 

echo "$wallpaper" > ~/.cache/current_wall_path.txt
echo "mainbox { background-image: url(\"$wallpaper\", width); }" > ~/.cache/current_wall.rasi

# ----------------------------------------------------- 
# get wallpaper iamge name
# ----------------------------------------------------- 

newwall=$(echo $wallpaper | xargs basename)

# ----------------------------------------------------- 
# Reload waybar with new colors
# -----------------------------------------------------

~/dots/waybar/launch.sh

# ----------------------------------------------------- 
# Generate the starship.toml file with new colors
# -----------------------------------------------------

~/dots/scripts/waltostarship.sh


# ----------------------------------------------------- 
# Set the new wallpaper
# -----------------------------------------------------
# transition_type="wipe"
# transition_type="outer"
 transition_type="random"

swww img $wallpaper \
    --transition-bezier .43,1.19,1,.4 \
    --transition-fps=60 \
    --transition-type=$transition_type \
    --transition-duration=1.0 \
    --transition-pos "$( hyprctl cursorpos )"

# ----------------------------------------------------- 
# Update Dunst theme and Send notification
# ----------------------------------------------------- 
if [ "$isFromCache" = false ]; then
echo "passed"
~/dots/scripts/updateRest.sh
fi

sleep 1
notify-send "Colors and Wallpaper updated" "with image $newwall"

# ----------------------------------------------------- 
# Generate the new gtk,qt etc with oomox file with new colors
# -----------------------------------------------------
if [ "$isFromCache" = false ]; then
echo "passed"
~/dots/scripts/genQTGTK.sh

fi

echo "DONE!"
