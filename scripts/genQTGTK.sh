oomox-cli ~/.cache/wal/colors-oomox -o testing_cli
numix="numix"
papirus="papirus"
suru="suruplus"
suru_aspromauros="suruplus_aspromauros"
none="Do not Generate Icons"

choice=$(printf "$numix\n$suru\n$suru_aspromauros\n$papirus\n$none" | rofi -dmenu -p "Select Icon Theme" -config ~/dots/rofi/config-dmenu.rasi) 


if [ "$choice" != "$none" ] ; then
#	showNotification $line_count &
run_script="/opt/oomox/plugins/icons_$choice/change_color.sh" 

$run_script -o testing_cli -d ~/.icons/testing_cli ~/.cache/wal/colors-oomox > >(while read -r line; do
        chk=$((chk +$(echo $line|wc -l)))
        progress=$(( (chk - 1) * 100 / 5  ))
	dunstify -t 100000 -h int:value:$progress "Generating Icons Colorscheme..." 
done)

dunstify   "Icon ColorScheme Generation Completed" 
sleep 2
dunstctl close

fi


