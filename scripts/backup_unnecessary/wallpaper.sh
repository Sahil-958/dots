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
	    wal -q -i "$path"
	    isFromCache=true
        else
	    wallpath=$(find ~/walls/ -type f -regex ".*\.\(jpg\|jpeg\|png\|gif\|bmp\)" | shuf -n 1)
            wal -q -i "$wallpath"
        fi
    ;;

    # Select wallpaper with rofi
    "select")
    selected=$( find "$HOME/walls/" -type f -regex ".*\.\(jpg\|jpeg\|png\|gif\|bmp\)" | sort -R | while read rfile 
    do
        basename=$(basename "$rfile")
        echo -en "$basename\x00icon\x1f/${rfile}\n"
    done | rofi -window-title "Wall Selector" -dmenu -replace -config ~/dots/config/rofi/config-walls.rasi)

        
#    selected=$( find ~/walls/ -type f -regex ".*\.\(jpg\|jpeg\|png\|gif\|bmp\)" -printf "%f\n"| rofi -dmenu -replace -config ~/dots/config/rofi/config-wallpaper.rasi)
        if [ ! "$selected" ]; then
            echo "No wallpaper selected"
            exit
        fi
	wallpath=$(find ~/walls/ -type f -name "$selected")
	wal -q -i "$wallpath"  
    ;;
    
    # Randomly select Remote wallpaper 
    remote)
        notify-send "Wallpaper.sh" "selecting Remote wallpaper randomly"
        wallpath="$(~/dots/scripts/remote_wall.sh -m random)"
        wal -q -i "$wallpath"
    ;;

    # Randomly select wallpaper 
    *)
        if [ "$1" != "" ] && [ -f "$1" ]; then
            notify-send "Wallpaper.sh" "Setting Supplied Wallpaper"
            wallpath="$1"
            wal -q -i "$wallpath"
        else
        notify-send "Wallpaper.sh" "selecting wallpaper randomly"
	    wallpath=$(find ~/walls/ -type f -regex ".*\.\(jpg\|jpeg\|png\|gif\|bmp\)" | shuf -n 1)
            wal -q -i "$wallpath"
        fi
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

newwall=$(echo "$wallpaper" | xargs basename)

# ----------------------------------------------------- 
# Set the new wallpaper
# -----------------------------------------------------
# transition_type="wipe"
# transition_type="outer"
 transition_type="random"

swww img "$wallpaper" \
    --transition-bezier .43,1.19,1,.4 \
    --transition-fps=60 \
    --transition-type="$transition_type" \
    --transition-duration=1.0 \
    --transition-pos "$( hyprctl cursorpos )"

# ----------------------------------------------------- 
# Update Rest of program themes and Send notification
# ----------------------------------------------------- 
if [ "$isFromCache" = false ]; then
echo "passed"
~/dots/scripts/updateRest.sh
fi
sleep 1
body="Colors and Wallpaper updated with image $newwall. <img src=\"$wallpaper\"/>"
notify-send "Wallpaper.sh" "$body"
echo "DONE!"
