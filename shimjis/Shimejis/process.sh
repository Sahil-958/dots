#!/bin/bash

# Get the current directory
current_dir=$PWD

# Loop through each directory in the current directory
for dir_path in "$current_dir"/*; do
    if [ -d "$dir_path" ] && [ "$(basename "$dir_path")" != "bec-noir" ]  && [ "$(basename "$dir_path")" != "default" ] && [ "$(basename "$dir_path")" != "octane" ]; then
        rm -rf "$dir_path"/conf/*
        cp bec-noir/conf/* "$dir_path"/conf/
    fi
done

