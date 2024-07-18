#!/bin/bash
source ~/.cache/wal/colors-swaylock.sh

output=$(cat <<EOF

ignore-empty-password
font="Fira Sans Semibold"

clock
timestr=%R
datestr=%a, %e of %B

# Add current screenshot as wallpaper
# screenshots

# Add an image as a background 
# In my setup the current wallpaper (requires wallpaper scripts in /scripts)
image=$wallpaper

# Fade in time
fade-in=1

# Effect for background
# effect-blur=20x6
# effect-greyscale
effect-pixelate=5

# Show/Hide indicator circle
indicator

# smaller indicator
indicator-radius=200

# bigger indicator
# indicator-radius=300

indicator-thickness=3
indicator-caps-lock

# Define all colors

key-hl-color=00000066
separator-color=00000000

inside-color=00000033
inside-clear-color=ffffff00
inside-caps-lock-color=ffffff00
inside-ver-color=ffffff00
inside-wrong-color=ffffff00

ring-color=$foreground
ring-clear-color=$foreground
ring-caps-lock-color=$foreground
ring-ver-color=$foreground
ring-wrong-color=$foreground

line-color=00000000
line-clear-color=${foreground}A0
line-caps-lock-color=${foreground}A0
line-ver-color=${foreground}A0
line-wrong-color=${foreground}A0

text-color=$foreground
text-clear-color=$foreground
text-ver-color=$foreground
text-wrong-color=$foreground

bs-hl-color=$foreground
caps-lock-key-hl-color=ffffffFF
caps-lock-bs-hl-color=ffffffFF
disable-caps-lock-text
text-caps-lock-color=$foreground

EOF
)

printf "%b\n" "$output" > ~/.config/swaylock/config
