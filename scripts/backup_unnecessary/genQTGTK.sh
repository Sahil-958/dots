oomox-cli ~/.cache/wal/colors-oomox -o testing_cli
numix="numix"
papirus="papirus"
suru="suruplus"
suru_aspromauros="suruplus_aspromauros"
none="Do not Generate Icons"

source ~/.cache/wal/colors.sh
icon_dir="/home/sawhill/.cache/icon_theme_cache"
mkdir -p "$icon_dir"
wall=${wallpaper//[\/.]/_}
icon_dir+="/$wall"
#cp "~/.icons/testing_cli" "$icon_dir"
echo "$icon_dir"
if [ -d "$icon_dir" ]; then
    echo "exist"
    rm ~/.icons/testing_cli
    ln -sf "$icon_dir" ~/.icons/testing_cli
    notify-send "Updated Icon Theme ColorScheme"
    exit 0
fi

choice=$(printf "$numix\n$suru\n$suru_aspromauros\n$papirus\n$none" | rofi -dmenu -p "Select Icon Theme" -config ~/dots/config/rofi/config-dmenu.rasi) 

if [ "$choice" != "$none" ] ; then
#	showNotification $line_count &
run_script="/opt/oomox/plugins/icons_$choice/change_color.sh" 

notification_id=$(notify-send -p -t 100000 -h int:value:"0" "genQTGTK.sh" "Generating Icons Colorscheme..." )

"$run_script" -o testing_cli -d "$icon_dir" ~/.cache/wal/colors-oomox > >(while read -r line; do
        chk=$((chk +$(echo "$line"|wc -l)))
        progress=$(( (chk - 1) * 100 / 5  ))
	notify-send -t 100000 -u "Low" -h int:value:"$progress" -r "$notification_id" "genQTGTK.sh" "Generating Icons Colorscheme..." 
done)

rm ~/.icons/testing_cli
ln -sf "$icon_dir" ~/.icons/testing_cli

notify-send "genQTGTK.sh" "Icon ColorScheme Generation Completed" -r "$notification_id"

fi


