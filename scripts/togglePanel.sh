#!/bin/bash

# Function to get the current hiding state of the panel
get_hiding_state() {
  qdbus_output=$(qdbus6 org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript "print(JSON.stringify(panels()[0].hiding, null, 4))")
  echo "$qdbus_output"
}

# Function to toggle the panel's hiding state
toggle_hiding_state() {
  current_state=$(get_hiding_state)

  if [ "$current_state" == "\"autohide\"" ]; then
    new_state="\"none\""
    kwriteconfig6 --file kwinrc --group Script-krohnkite --key screenGapBottom 18
  else
    new_state="\"autohide\""
    kwriteconfig6 --file kwinrc --group Script-krohnkite --key screenGapBottom 5
  fi

  qdbus6 org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript "panels()[0].hiding = $new_state"
}

reload_script() {
  kwriteconfig6 --file kwinrc --group Plugins --key krohnkiteEnabled false
  qdbus6 org.kde.KWin /KWin org.kde.KWin.reconfigure
  sleep 0.2s
  kwriteconfig6 --file kwinrc --group Plugins --key krohnkiteEnabled true
  qdbus6 org.kde.KWin /KWin org.kde.KWin.reconfigure
}

# Main script execution
toggle_hiding_state
reload_script
