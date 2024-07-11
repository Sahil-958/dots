#!/bin/bash
#check if $2 arg is empty
image=$1
scheme=$2
if [ "$2" = "" ]; then
    scheme="scheme-content"
fi
if [ "$1" = "" ]; then
    exit 1
fi

matugen image "$image" -t "$scheme"
# using pywal for konsole and other 
wal -i "$image"
~/dots/scripts/matugenUpdateRest.sh &
