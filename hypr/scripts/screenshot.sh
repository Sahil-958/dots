#!/bin/bash
#  ____                               _           _    
# / ___|  ___ _ __ ___  ___ _ __  ___| |__   ___ | |_  
# \___ \ / __| '__/ _ \/ _ \ '_ \/ __| '_ \ / _ \| __| 
#  ___) | (__| | |  __/  __/ | | \__ \ | | | (_) | |_  
# |____/ \___|_|  \___|\___|_| |_|___/_| |_|\___/ \__| 
#                                                      
#  
# by Stephan Raabe (2023) 
# ----------------------------------------------------- 
source ~/.cache/wal/colors.sh
DIR="$HOME/Pictures/screenshots/"
NAME="screenshot_$(date +%d%m%Y_%H%M%S).png"

option1="Window"
option2="Selected area"
option3="Fullscreen (delay 3 sec)"

options="$option1\n$option2\n$option3"

choice=$(echo -e "$options" | rofi -dmenu -replace -config ~/dots/rofi/config-dmenu.rasi -i -p "Take Screenshot")

case $choice in
    $option1)
    ~/dots/hypr/scripts/window_screenshot.sh
    ;;
    $option2)
        grim -g "$(slurp -c "$background" -b "${foreground}B0")" - | swappy -f -
        notify-send -i "/home/sawhill/.icons/testing_cli/actions/16/zoom-fit-selection.svg" "Screenshot created" "Mode: Selected area"
    ;;
    $option3)
        sleep 3
        grim - | swappy -f -
        notify-send -i "/home/sawhill/.icons/testing_cli/apps/16/camera.svg" "Screenshot created" "Mode: Fullscreen"
    ;;
esac
