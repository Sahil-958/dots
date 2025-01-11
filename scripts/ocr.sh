# Make sure you have tesseract and tesseract-data-your_lang packages installed

# Check if KDE is running by looking for the environment variable `KDE_FULL_SESSION`
if [ -n "$KDE_FULL_SESSION" ]; then
  # Use spectacle if KDE is running
  text=$(spectacle -bnro /dev/stdout | tesseract stdin stdout)
else
  # Use grim if KDE is not running
  selection="$(agsv1 -b ocr -c ~/.config/ags/slurp/index.js)"
  text=$(grim -t png -g "$selection" - | tesseract stdin stdout)
fi

if [ -z "$text" ]; then
  notify-send "No text detected" "Please select a valid text"
  exit 1
fi

wl-copy "$text" && notify-send "Selection Copied into the clipboard" "$text"
