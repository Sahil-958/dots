#!/bin/bash

if [ "$(tty)" = "/dev/tty1" ]; then
  # echo "Starting Hyprland..." && Hyprland >.hyprland.log.txt 2>.hyprland.err.txt
  # startplasma-wayland
  #
  clear

  echo "Select your session:"
  echo "1) KDE Wayland"
  echo "2) KDE X11"
  echo "3) Remain in TTY"

  # Prompt for user input
  read -p "Enter the number for your desired session (1, 2, or 3): " SESSION_CHOICE

  case $SESSION_CHOICE in
  1)
    # Start KDE Wayland session
    echo "Starting KDE Wayland..."
    export XDG_SESSION_TYPE=wayland
    exec startplasma-wayland >.kde.log.txt 2>.kde.err.txt
    ;;
  2)
    # Start KDE X11 session
    echo "Starting KDE X11..."
    export XDG_SESSION_TYPE=x11
    exec startplasma-x11 >.kde.log.txt 2>.kde.err.txt
    ;;
  3)
    echo "Here's your TTY!"
    ;;
  *)
    echo "Invalid option, defaulting to KDE Wayland..."
    export XDG_SESSION_TYPE=wayland
    exec startplasma-wayland >.kde.log.txt 2>.kde.err.txt
    ;;
  esac
fi
