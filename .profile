#!/bin/sh

if [ "$(tty)" = "/dev/tty1" ]; then
  echo "Starting Hyprland..." && Hyprland > .hyprland.log.txt 2> .hyprland.err.txt
fi


