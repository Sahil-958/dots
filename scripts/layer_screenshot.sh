#!/bin/sh
hyprctl_output=$(hyprctl layers -j)
namespaces=$(echo "$hyprctl_output" |  jq -r '. | to_entries | .[0].value.levels[] | .[] | .namespace')

case $1 in
       term)
           namespace=$(echo -e "$namespaces\nnone" | fzf)
           ;;
        *)
           namespace=$(echo -e "$namespaces\nnone" | rofi -dmenu -p "Select Window To Capture" -i -config ~/dots/config/rofi/config-dmenu.rasi)
           ;;
esac

[[ -z $namespace ]] && exit 0
if [[ ! "$namespaces" =~ "$namespace" ]]; then
    notify-send "Selected option does not match any window. Exiting script."
    exit 1
fi

result=$(echo "$hyprctl_output" | jq -r --arg namespace "$namespace" 'to_entries[] | .value.levels[] | map(select(.namespace == $namespace)) | .[] | "\(.x),\(.y),\(.w),\(.h)"')

IFS=',' read -r x y width height <<< "$result"

sleep 1s
grim -g "$x,$y ${width}x$height" - | swappy -f -
