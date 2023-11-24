oomox-cli ~/.cache/wal/colors-oomox -o testing_cli
generate="generate icons theme"
doNotGenerate="do no generate icons theme"

choice=$(printf "$generate\n$doNotGenerate" | rofi -dmenu) 


if [ "$choice" == "$generate" ] ; then
#	showNotification $line_count &
run_script="/opt/oomox/plugins/icons_numix/change_color.sh" 

$run_script -o testing_cli -d ~/.icons/testing_cli ~/.cache/wal/colors-oomox > >(while read -r line; do
        chk=$((chk +$(echo $line|wc -l)))
        progress=$(( (chk - 1) * 100 / 6  ))
	dunstify -u normal -t 10000 -r 1337 -h int:value:$progress "Generating Icons Colorscheme..." 
done)

dunstify -u normal -r 1337  "Icon ColorScheme Generation Completed" 
#dunstify -u normal -C 1337 

fi


