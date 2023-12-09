case $1 in
	zoomin)
		prevVal=$(hyprctl getoption misc:cursor_zoom_factor |grep float | cut -d ':' -f2)
		hyprctl keyword misc:cursor_zoom_factor $(echo "$prevVal + 0.05"|bc)
		;;
	zoomout)
		prevVal=$(hyprctl getoption misc:cursor_zoom_factor |grep float | cut -d ':' -f2)
		hyprctl keyword misc:cursor_zoom_factor $(echo "$prevVal - 0.05"|bc)
		;;
	reset)
		hyprctl keyword misc:cursor_zoom_factor 1.0
		;;
	rofi)
		customVal=$(rofi -dmenu -config ~/dots/rofi/config-compact.rasi)
		hyprctl keyword misc:cursor_zoom_factor $customVal
		;;
	*)
		hyprctl keyword misc:cursor_zoom_factor $1
		;;
esac




