#!/bin/bash
#  ____                               _           _    
# / ___|  ___ _ __ ___  ___ _ __  ___| |__   ___ | |_  
# \___ \ / __| '__/ _ \/ _ \ '_ \/ __| '_ \ / _ \| __| 
#  ___) | (__| | |  __/  __/ | | \__ \ | | | (_) | |_  
# |____/ \___|_|  \___|\___|_| |_|___/_| |_|\___/ \__| 
#                                                      
#  
 
# ----------------------------------------------------- 
source ~/.cache/wal/colors.sh
DIR="$HOME/Pictures/screenshots/"
NAME="screenshot_$(date +%d%m%Y_%H%M%S).png"

option1="Window"
option2="Layer"
option3="Selected area"
option4="Fullscreen (delay 3 sec)"

options="$option1\n$option2\n$option3\n$option4"

choice=$(echo -e "$options" | rofi -dmenu -replace -config ~/dots/config/rofi/config-dmenu.rasi -i -p "Take Screenshot")

case $choice in
    $option1)
    ~/dots/scripts/window_screenshot.sh
    ;;
    $option2)
    ~/dots/scripts/layer_screenshot.sh 
    ;;
    $option3)
        #grim -g "$(slurp -b "${background}90" -c "$foreground")" - | swappy -f -
        grim -g "$(ags -b agsSlurp -c ~/.config/ags/slurp/index.js)" - | swappy -f -
        notify-send -i "/home/sawhill/.icons/testing_cli/actions/16/zoom-fit-selection.svg" "Screenshot created" "Mode: Selected area"
    ;;
    $option4)
        sleep 3
        grim - | swappy -f -
        notify-send -i "/home/sawhill/.icons/testing_cli/apps/16/camera.svg" "Screenshot created" "Mode: Fullscreen"
    ;;
esac
