#!/bin/bash

#CAUTION: If you are gonna use this script note that unauthenticated api requests are limited by github this script make 2 rate and 2 resource requests each time it's run and we get 60 requests per hour for unauthenticated requests
#You can use following to check the status: curl https://api.github.com/rate_limit 

#
# Replace the following placeholders with your GitHub username, repository name, branch, and directory path
username="Sahil-958"
repo="walls"
branch="main"

# Replace the following placeholders with your GitHub username, repository name, branch, and directory path
username1="Sahil-958"
repo1="walls_superset"
branch1="main"

# Get the list of files in the repository using GitHub API with recursive tree listing
tree_url="https://api.github.com/repos/$username/$repo/git/trees/$branch?recursive=1"
tree_url1="https://api.github.com/repos/$username1/$repo1/git/trees/$branch1?recursive=1"
file_list=$(curl -s "$tree_url" | jq -r '.tree[] | select(.type == "blob") | .path'| sed '/\(\.jpeg|\.jpg\|\.png\|\.gif\|\.webp\)/!d')
file_list1=$(curl -s "$tree_url1" | jq -r '.tree[] | select(.type == "blob") | .path'| sed '/\(\.jpeg|\.jpg\|\.png\|\.gif\|\.webp\)/!d')

random_file=$(echo -e "$file_list"| shuf -n 1)
random_file1=$(echo -e "$file_list1"| shuf -n 1)

# Generate a random number between 1 and 2
random_number=$(( (RANDOM % 2) + 1 ))
# random_number=$(echo "1 2" | shuf -n 1) backup for shell that doesn't have RANDOM var

# Switch case statement based on the random number
case $random_number in
    1)
        curl -fsSL "https://raw.githubusercontent.com/$username/$repo/$branch/$random_file" > ~/.cache/current_wallpaper.png
        ;;
    2)
        curl -fsSL "https://raw.githubusercontent.com/$username1/$repo1/$branch1/$random_file1" > ~/.cache/current_wallpaper.png
        ;;
    *)
        echo "Invalid random number"
        ;;
esac

