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

󰒲
' | rofi -dmenu -format 'd' -kb-select-1 'S' -kb-select-2 'r' -kb-select-3 'e' -kb-select-4 'l' -kb-select-5 's' -kb-select-6 'h' -i -matching regex -config ~/dots/config/rofi/config-power.rasi -p "$prompt" -mesg "$message" -theme-str "
textbox-greeting{
content: \"Don't forget to touch the grass\";
}
")

# Check the selected action and run the appropriate command
case $action in
    "1")
        # Run shutdown command
        sleep 0.5s
        systemctl poweroff 
        ;;
    "2")
        # Run reboot command
        sleep 0.5s
        systemctl reboot
        ;;
    "3")
        # Run logout command (replace with your preferred logout command)
        sleep 0.5s
        hyprctl dispatch exit
        ;;
    "4")
        # Run lock command (replace with your preferred lock command)
        sleep 0.5s
        swaylock 
        ;;
    "5")
        # Run suspend command
        sleep 0.5s
        systemctl suspend 
        ;;
    "6")
        # Run hibernate command
        sleep 0.5s
        systemctl hibernate 
        ;;
    *) 
        # Handle invalid selection or cancellation
        echo "No action selected or cancelled."
        ;;
esac

