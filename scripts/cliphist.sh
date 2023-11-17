#!/bin/bash
#   ____ _ _       _     _     _    
#  / ___| (_)_ __ | |__ (_)___| |_  
# | |   | | | '_ \| '_ \| / __| __| 
# | |___| | | |_) | | | | \__ \ |_  
#  \____|_|_| .__/|_| |_|_|___/\__| 
#           |_|                     
#  
# by Stephan Raabe (2023) 
# ----------------------------------------------------- 

case $1 in
    d) cliphist list | rofi -dmenu -config ~/dots/rofi/config-cliphist.rasi | cliphist delete
       ;;

    w) if [ `echo -e "Clear\nCancel" | rofi -dmenu -config ~/dots/rofi/config-short.rasi` == "Clear" ] ; then
            cliphist wipe
       fi
       ;;
    q) cliphist list | rofi -dmenu -config ~/dots/rofi/config-cliphist.rasi | cliphist decode | qrencode -o- -l H -s 25 -m 2 --dpi=192 | swappy -f - 
       ;;
    *) cliphist list | rofi -dmenu -config ~/dots/rofi/config-cliphist.rasi | cliphist decode | wl-copy
       ;;
esac
