#!/bin/sh

function notify(){
   # Get some random icon
    icon=$(find ~/.icons/ -name "*adapter*"|shuf -n 1)

    user=$(who | awk '{print $1}' | head -n 1)
    uid=$(id -u "$user")
    DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus  /usr/bin/notify-send -i "$icon" "$@"
}

function stats(){
       time=$(cat ~/.cache/chargeLog 2>/dev/null | head -n 1 || echo "can't retrieve status")
       currentTime=$(date +%s)
       preCharg=$(cat ~/.cache/chargeLog 2>/dev/null | tail -n 1 || echo "can't retrieve status")
       chargDiff=$(echo "$per - $preCharg" | bc )
       timeDiff=$(echo "$currentTime - $time" | bc )
       formattedTime=$(date -d "@$timeDiff" -u +%H:%M:%S 2>/dev/null || echo "Error")
}

chargDiff=""
formattedTime=""
per=$(cat /sys/class/power_supply/BAT0/capacity)

case $1 in
    plugged) 
             stats
             notify "Charger Plugged" "Dischargred $chargDiff% in $formattedTime"
             echo -e "$(date +%s)\n$per" > ~/.cache/chargeLog
    ;;
    unplugged) 
               stats
               notify "Charger Unplugged" "Chargred $chargDiff% in $formattedTime"
               echo -e "$(date +%s)\n$per" > ~/.cache/chargeLog
    ;;
    init)
             notify "Charginig Stats Initialized"
             echo -e "$(date +%s)\n$per" > ~/.cache/chargeLog
    ;;
    *) notify ">|$1|<"
    ;;
esac
