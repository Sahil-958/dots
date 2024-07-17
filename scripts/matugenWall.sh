#!/bin/bash
#check if $2 arg is empty
image=$1
scheme=$2
theme=$3
if [ "$2" = "" ]; then
    scheme="scheme-content"
fi
if [ "$1" = "" ]; then
    exit 1
fi
if [ "$3" = "" ]; then
    theme="dark"
fi

matugen image "$image" -t "$scheme" --mode "$theme"
# using pywal for konsole and other 
wal -i "$image"
~/dots/scripts/matugenUpdateRest.sh &
