#!/bin/sh
hyprctl_output=$(hyprctl clients -j)
titles=$(echo "$hyprctl_output" | jq -r 'map(select(.title != "")) | .[].title')
title=$(echo -e "$titles\nnone" | rofi -dmenu -p "Select Window To Capture" -i -config ~/dots/rofi/config-dmenu.rasi)
if ! echo "$titles" | grep -q "^$title$"; then
    notify-send "Selected option does not match any window. Exiting script."
    exit 1
fi

result=$(echo "$hyprctl_output" | jq -r ".[] | select(.title | contains(\"$title\")) | .title, (.class // empty), .at[0], .at[1], .size[0], .size[1], .workspace.id, .initialTitle, .fullscreenMode ")

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

border_size=$(hyprctl getoption -j general:border_size | jq .int)
echo "Title: $title"
echo "Class: $class"
echo "atx: $atx"
echo "aty: $aty"
echo "sizex: $sizex"
echo "sizey: $sizey"
echo "ID: $id"
echo "initialTitle: $initialTitle"
echo "fullscreenMode: $fullscreenMode"
echo "Command Executed: grim -g "$(($atx + $border_size + $border_size)),$(($aty - $border_size)) $(($sizex + $border_size + $border_size))x$(($sizey + $border_size + $border_size))" - | swappy -f -"

hyprctl dispatch workspace $id
hyprctl dispatch focuswindow "$initialTitle"

sleep 1s
grim -g "$(($atx - $border_size )),$(($aty - $border_size)) $(($sizex + $border_size + $border_size))x$(($sizey + $border_size + $border_size))" - | swappy -f -

