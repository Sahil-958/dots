#!/bin/sh
cat ~/dots/scripts/chars.txt|sort -u|rofi -dmenu -i -matching fuzzy -config ~/dots/rofi/config-dmenu.rasi -theme-str '
*{font: "ComicShannsMono Nerd Font 18";} 
listview{columns: 3; fixed-columns: false;} window{ width: 70%; height: 40%;}' |sed 's/^\(.\).*/\1/'|tr -d '\n'|wl-copy
