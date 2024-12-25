# Make sure you have tesseract and tesseract-data-your_lang packages installed

source ~/.cache/wal/colors.sh

#grim -t png -g "$(slurp -b "${background}90" -c "${foreground}")" - | tesseract stdin stdout | wl-copy && notify-send "Selection Copied into the clipborad"
# Use below if don't want notify-send to run when you don't selecte anything
#selection="$(slurp -b "${background}90" -c "$foreground")" && grim -t png -g "$selection" - | tesseract stdin stdout | wl-copy && notify-send "Selection Copied into the clipboard"
#
#
#selection="$(slurp -b "${background}90" -c "$foreground")"
selection="$(agsv1 -b ocr -c ~/.config/ags/slurp/index.js)"
text=$(grim -t png -g "$selection" - | tesseract stdin stdout)
if [ "$text" = "" ]; then
  notify-send "No text detected" "Please select a valid text"
  exit 1
fi
wl-copy "$text" && notify-send "Selection Copied into the clipboard" "$text"
