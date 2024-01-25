#!/bin/bash

# Note that GitHub api calls are rate limitied
# You can use the following to check the status: curl https://api.github.com/rate_limit

dest_dir="/home/sawhill/wall/remote"

# Define repositories and branches as arrays
# User/Repo_name:Branch_name
repositories=(
    "Sahil-958/walls:main"
    "Sahil-958/walls_superset:main"
)

# Generate a random number between 0 and 1 to select a repository
random_index=$(( RANDOM % ${#repositories[@]} ))

repo_branch=(${repositories[$random_index]//:/ })  # Split repository and branch
repo=${repo_branch[0]}
branch=${repo_branch[1]}
tree_url="https://api.github.com/repos/$repo/git/trees/$branch?recursive=1"
file_list=$(curl -s "$tree_url" | jq -r '.tree[] | select(.type == "blob") | .path' | grep -E '\.(jpeg|jpg|png|gif|webp)$')
random_file_path=$(echo -e "$file_list" | shuf -n 1)
subdir_name=$(dirname "$random_file_path")
file_name=$(basename "$random_file_path")
mkdir -p "$dest_dir/$subdir_name"
curl -fsSL "https://raw.githubusercontent.com/$repo/$branch/$random_file_path" > "$dest_dir/$subdir_name/$file_name"

echo "$dest_dir/$subdir_name/$file_name"

