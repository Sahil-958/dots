#!/bin/bash
#   ____ _ _       _     _     _    
#  / ___| (_)_ __ | |__ (_)___| |_  
# | |   | | | '_ \| '_ \| / __| __| 
# | |___| | | |_) | | | | \__ \ |_  
#  \____|_|_| .__/|_| |_|_|___/\__| 
#           |_|                     
#  
 
# ----------------------------------------------------- 

case $1 in
    d) cliphist list | rofi -window-title "Clipboard" -dmenu -config ~/dots/config/rofi/config-cliphist.rasi | cliphist delete
       ;;

    w) if [ "$(echo -e "Clear\nCancel" | rofi -window-title "Clipboard" -dmenu -config ~/dots/config/rofi/config-short.rasi)" == "Clear" ] ; then
            cliphist wipe
       fi
       ;;
    q) cliphist list | rofi -window-title "Clipboard" -dmenu -config ~/dots/config/rofi/config-cliphist.rasi | cliphist decode | qrencode -o- -l H -s 25 -m 2 --dpi=192 | swappy -f - || notify-send "Text too large to encode" -t 10000 -u critical
       ;;
    *) cliphist list | rofi -window-title "Clipboard" -dmenu -config ~/dots/config/rofi/config-cliphist.rasi | cliphist decode | wl-copy
       ;;
esac
