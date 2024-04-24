#!/bin/sh
hyprctl_output=$(hyprctl clients -j)
titles=$(echo "$hyprctl_output" | jq -r 'map(select(.title != "")) | .[].title')
case $1 in
       term)
           title=$(echo -e "$titles\nnone" | fzf)
           ;;
        *)
           title=$(echo -e "$titles\nnone" | rofi -dmenu -p "Select Window To Capture" -i -config ~/dots/config/rofi/config-dmenu.rasi)
           ;;
esac

[[ -z $title ]] && exit 0
if [[ ! "$titles" =~ "$title" ]]; then
    notify-send "Selected option does not match any window. Exiting script."
    exit 1
fi

result=$(echo "$hyprctl_output" | jq -r ".[] | select(.title == \"$title\") | .title, (.class // empty), .at[0], .at[1], .size[0], .size[1], .workspace.id, .initialTitle, .fullscreenMode, .pid ")

IFS='
' # Set IFS to newline
set -- $result
title="$1"
class="$2"
atx="$3"
aty="$4"
sizex="$5"
sizey="$6"
id="$7"
initialTitle="$8"
fullscreenMode="$9"
pid="${10}"
border_size=$(hyprctl getoption -j general:border_size | jq .int)

hyprctl dispatch workspace $id
hyprctl dispatch focuswindow "$pid"

sleep 1s
if [ "$class" = "Rofi" ]; then
    grim -g "$atx,$aty ${sizex}x$sizey" - | swappy -f -
else
    grim -g "$(($atx - $border_size)),$(($aty - $border_size)) $(($sizex + $border_size + $border_size))x$(($sizey + $border_size + $border_size))" - | swappy -f -
fi
