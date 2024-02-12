#!/bin/sh

case $1 in
    update)
        curl -fsSL https://raw.githubusercontent.com/ryanoasis/nerd-fonts/master/glyphnames.json > ~/dots/scripts/glyphnames.json && echo "glyphnames.json updated"
        ;;
    *)
        jq -r '. | to_entries[] | select(.key != "METADATA") | "\(.value.char)   \(.key)"' ~/dots/scripts/glyphnames.json |rofi -p "NerdFont Glyphs" -dmenu -i -matching regex -config ~/dots/rofi/config-dmenu.rasi -theme-str '
        *{font: "ComicShannsMono Nerd Font 18";} 
        listview{columns: 3; fixed-columns: false;} window{ width: 70%; height: 40%;}' |sed 's/^\(.\).*/\1/'|tr -d '\n'|wl-copy
        ;;
esac
