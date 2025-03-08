#!/bin/bash

current=$(kreadconfig5 --file kwinrc --group Plugins --key krohnkiteEnabled)

if [ "$current" = "true" ]; then
  kwriteconfig5 --file kwinrc --group Plugins --key krohnkiteEnabled false
elif [ "$current" = "false" ]; then
  kwriteconfig5 --file kwinrc --group Plugins --key krohnkiteEnabled true
fi

qdbus6 org.kde.KWin /KWin reconfigure
