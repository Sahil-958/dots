maxBrightness=$(brightnessctl -qc backlight max)   
currentBrightness=$(brightnessctl -qc backlight get)
cbPercentage=$((  ($currentBrightness * 100 ) / $maxBrightness ))
maxbPercentage=$(( ($maxBrightness * 100 ) / $maxBrightness )) 
case $1 in
    increase) brightnessctl -qc backlight set +1
       ;;
    
    decrease) brightnessctl -qc backlight set 1-
       ;;

    max) brightnessctl -qc backlight set $maxBrightness
	    notify-send -t 1500 "Brightness Setted to Max"  
        ;;
    min) brightnessctl -qc backlight set 0
	    notify-send -t 1500 "Brightness Setted to Min"
        ;;
    custom) brightnessctl -qc backlight set $2
	    notify-send -t 5 "Brightness Setted to Min"
        ;;
esac
printf '{"text": "%s", "tooltip": "%s out of %s" , "class": "%s/%s", "percentage": %s }\n' "$cbPercentage" "$currentBrightness" "$maxBrightness" "$cbPercentage" "$maxbPercentage" "$cbPercentage" 
