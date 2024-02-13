uptime=$(uptime -p)
uptime=${uptime//up/Uptime}
updates=$(pacman -Qu|wc -l)
#prompt="$USER@$HOSTNAME"
prompt="Don't forget to touch some Grass!"
message="$uptime | Updates Available: $updates"
# Prompt user to select an action using rofi
# echo -en "testing\0icon\x1f<span color='@foreground'>⏻</span>" | ./rofi -dmenu
action=$(echo ' 

󰍃
' | rofi -dmenu -kb-select-1 's' -kb-select-2 'r' -kb-select-3 'e' -kb-select-4 'l' -i -matching regex -config "~/dots/rofi/config-power.rasi" -p "$prompt" -mesg "$message" -theme-str '
window { fullscreen: true; }
')


# Check the selected action and run the appropriate command
case $action in
    "")
        # Run shutdown command
        sleep 0.5s
        systemctl poweroff 
        ;;
    "")
        # Run reboot command
        sleep 0.5s
        systemctl reboot
        ;;
    "󰍃")
        # Run logout command (replace with your preferred logout command)
        sleep 0.5s
        hyprctl dispatch exit
        ;;
    "")
        # Run lock command (replace with your preferred lock command)
        sleep 0.5s
        swaylock 
        ;;
    *) 
        # Handle invalid selection or cancellation
        echo "No action selected or cancelled."
        ;;
esac

