# Make sure you have tesseract and tesseract-data-your_lang packages installed

source ~/.cache/wal/colors.sh

#grim -t png -g "$(slurp -b "${background}90" -c "${foreground}")" - | tesseract stdin stdout | wl-copy && notify-send "Selection Copied into the clipborad"
# Use below if don't want notify-send to run when you don't selecte anything
selection="$(slurp -b "${background}90" -c "${foreground}")" && grim -t png -g "$selection" - | tesseract stdin stdout | wl-copy && notify-send "Selection Copied into the clipboard"
