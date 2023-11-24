#!/bin/bash

randomSound=$(find ~/Music/apexNotificationSounds -type f -name '*.mp3'|shuf -n1)
pgrep mpg123 || mpg123 "$randomSound"
