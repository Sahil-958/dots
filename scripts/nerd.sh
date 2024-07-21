#!/bin/sh

case $1 in
    update)
        curl -fsSL https://raw.githubusercontent.com/ryanoasis/nerd-fonts/master/glyphnames.json > ~/dots/scripts/glyphnames.json && echo "glyphnames.json updated"
        ;;
    *)
        jq -r '. | to_entries[] | select(.key != "METADATA") | "\(.value.char)   \(.key) \(.value.code)"' ~/dots/scripts/glyphnames.json |fzf| sed 's/^\(.\).*/\1/' |wl-copy
        ;;
esac
