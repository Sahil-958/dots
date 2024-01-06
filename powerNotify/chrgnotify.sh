#!/bin/sh

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
    echo "$display $way0 $way1 $user $uid $@"
    DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus  /usr/bin/notify-send -i "$icon" "$@"
}

case $1 in
    plugged) notify "Charger Plugged"
       ;;
    
    unplugged) notify "Charger Unplugged"
       ;;
    *) notify "Undefined Option"
     ;;
esac
 
