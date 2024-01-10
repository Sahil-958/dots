#!/bin/sh
set -e
# I'm keeping the sudo invocation of notify-send that have addtition uneeded options specified  but only the last one has minimal needed options for working as intended 

function notify(){
    #Detect the name of the display in use
    #display=":$(ls /tmp/.X11-unix/* | sed 's#/tmp/.X11-unix/X##' | head -n 1)"
    #way0="wayland-0"
    #way1="wayland-1" 
    #Detect the user using such display
    #user=$(who | awk '{print $1}' | head -n 1)
    #Detect the id of the user
    #uid=$(id -u $user)
    #sudo -u $user DISPLAY=$display DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus /usr/bin/notify-send "$@"
    #sudo -u $user WAYLAND_DISPLAY=$way0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus /usr/bin/notify-send "$@"
    #sudo -u $user WAYLAND_DISPLAY=$way1 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus /usr/bin/notify-send "$@"
    #echo "$display $way0 $way1 $user $uid $@"
    #DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus  /usr/bin/notify-send "$@"
    # Get some random icon
    icon=$(find ~/.icons/ -name "*adapter*"|shuf -n 1)


    #only needed portion of the function
    user=$(who | awk '{print $1}' | head -n 1)
    uid=$(id -u $user)
    DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus  /usr/bin/notify-send -i "$icon" "$@"
}

per=$(cat /sys/class/power_supply/BAT0/capacity)

case $1 in
    plugged) notify "Charger Plugged"
             echo -e "$(date +%s)\n$per" > /tmp/chargeLog
    ;;
    unplugged) 
               notify "Charger Unplugged" 
               time=$(cat /tmp/chargeLog 2>/dev/null | head -n 1 || echo "can't retrieve status")
               currentTime=$(date +%s)
               preCharg=$(cat /tmp/chargeLog 2>/dev/null | tail -n 1 || echo "can't retrieve status")
               chargDiff="$(($per - $preCharg ))"
               timeDiff=$(("$currentTime" - $time))
               formattedTime=$(date -d "@$timeDiff" -u +%H:%M:%S)
               notify "Battery Stats" "Chargred $chargDiff% in $formattedTime"
    ;;
    *) notify ">|$1|<"
    ;;
esac
