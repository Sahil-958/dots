#!/bin/sh
cap(){
hyprctl dispatch workspace 3
sleep 0.3
($2) &
sleep 0.7

hyprctl_output=$(hyprctl clients -j)
titles=$(echo "$hyprctl_output" | jq -r 'map(select(.title != "")) | .[].title')
title="$1"
title=$(echo "$titles" |grep -i "$title")
result=$(echo "$hyprctl_output" | jq -r ".[] | select(.title | contains(\"$title\")) | .title, (.class // empty), .at[0], .at[1], .size[0], .size[1], .workspace.id, .initialTitle, .fullscreenMode, .pid ")

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
sleep 0.2s
hyprctl dispatch focuswindow "pid:$pid"
sleep 0.8s
hyprctl dispatch movecursor 0 0
sleep 0.3s

if [ "$class" = "Rofi" ]; then
    echo "grim -g "$atx,$aty ${sizex}x$sizey" ~/auto/"$title$iteration".png"
    grim -g "$atx,$aty ${sizex}x$sizey" ~/auto/"$title$iteration".png
else
    grim -g "$(($atx - $border_size)),$(($aty - $border_size)) $(($sizex + $border_size + $border_size))x$(($sizey + $border_size + $border_size))" ~/auto/$title$iteration.png
fi
hyprctl dispatch closewindow "pid:$pid"
sleep 0.5s
}


start=$(hyprctl activeworkspace -j|jq .id)
iteration="$1"
cap "rofi" "/home/sawhill/dots/scripts/wallpaper.sh select"
cap "rofi" "/home/sawhill/dots/scripts/nerd.sh"
cap "rofi" "/home/sawhill/dots/scripts/emoji.sh"
cap "rofi" "/home/sawhill/dots/scripts/calc.sh"
cap "rofi" "/home/sawhill/dots/scripts/cliphist.sh"
cap "rofi" "/home/sawhill/dots/waybar/themeswitcher.sh"
hyprctl dispatch exec "konsole -e btop"
cap "btop" " "
cap "wlogout" "wlogout"
hyprctl dispatch movecursor 1000 1000
grim -g "0,0 1920x34" ~/auto/waybar"$1".png
hyprctl dispatch exec "[float;size 80% 10%;center;]" konsole
cap "~" " "
mpg123 ~/Music/apexNotificationSounds/caustic/IF\ OUR\ PATHS\ CROSSED\ -\ AUDIO\ FROM\ JAYUZUMI.COM.mp3 > /dev/null > /dev/null 2>&1 &
cap "GLava" "glava"
hyprctl dispatch workspace 3
sleep 0.2s
notify-send -t 1000 "Hello Friend!"
sleep 0.5s
grim -g "1581,63 309x43" ~/auto/dunst"$1".png

cap "rofi" "/home/sawhill/dots/scripts/applauncher.sh"
cap "Dolphin" "dolphin"
cap "rofi" "/home/sawhill/dots/scripts/screenshot.sh"
sddm-greeter --test-mode --theme /usr/share/sddm/themes/sugar_candy/ &
cap "sddm-greeter" " "
cap "rofi" "/home/sawhill/dots/scripts/window_screenshot.sh"
