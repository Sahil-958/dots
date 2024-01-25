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

# Function to get a random file from a repository
get_file() {
    local repo_branch=(${repositories[$1]//:/ })  # Split repository and branch
    local repo=${repo_branch[0]}
    local branch=${repo_branch[1]}
    local tree_url="https://api.github.com/repos/$repo/git/trees/$branch?recursive=1"
    local file_list=$(curl -s "$tree_url" | jq -r '.tree[] | select(.type == "blob") | .path' | grep -E '\.(jpeg|jpg|png|gif|webp)$')
    local random_file_path=$(echo -e "$file_list" | shuf -n 1)
    local subdir_name=$(dirname "$random_file_path")
    local file_name=$(basename "$random_file_path")
    mkdir -p "$dest_dir/$subdir_name"
    curl -fsSL "https://raw.githubusercontent.com/$repo/$branch/$random_file_path" > "$dest_dir/$subdir_name/$file_name"
}

# Call the function with the randomly selected repository index
get_file "$random_index"

