#!/bin/bash
notify-send "Loading Config..."
if [ -f ~/.hyprland.sh ]; then
    sleep 1
    ~/.hyprland.sh
fi
