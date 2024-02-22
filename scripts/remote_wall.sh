#!/bin/bash

# Note that GitHub api calls are rate limitied
# You can use the following to check the status: curl https://api.github.com/rate_limit
# Or below one for more readable output, leaving reset time as timestamp use date -d @timestamp to convert to human readable format as with jq isn't not working very well with local time
# curl -s https://api.github.com/rate_limit | jq -r '.resources | to_entries[] | "\(.key): \(.value.used) used, \(.value.remaining) remaining, Reset on \(.value.reset)"'


dest_dir="/home/sawhill/wall/remote"

# Define repositories and branches as arrays
# User/Repo_name:Branch_name
repositories=(
    "Sahil-958/walls:main"
    "Sahil-958/walls_superset:main"
)

usage() {
cat <<EOF    
    Usage: $0 [OPTIONS] [REPOSITORIES]
    -h, --help          Display help
    -d, --dest-dir      Destination directory to save wallpapers
    -m, --mode          Mode to select a wallpaper
                        random: Select a random wallpaper from the repositories
                        rofi: Select a wallpaper using rofi
                        fzf: Select a wallpaper using fzf
    REPOSITORIES        List of repositories to fetch wallpapers from with format User/Repo_name:Branch_name
                        Example: Sahil-958/walls:main

    Example:
    $0 -m random -d ~/wall/remote "Sahil-958/walls:main" "Sahil-958/walls_superset:main"

EOF
    exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -m)
            shift
            mode=$1
            ;;
        -d)
            shift
            dest_dir=$1
            ;;
        -h)
            usage
            ;;
        -*)
            echo "Unrecognized option: $1" >&2
            usage
            ;;
        *)
            repositories+=("$1")
            ;;
    esac
    shift
done

if [[ -z $mode ]]; then
    echo "Mode not specified" >&2
    usage
fi

download_and_save() {
    repo=$1
    branch=$2
    file_path=$3
    subdir_name=$(dirname "$file_path")
    file_name=$(basename "$file_path")
    url="https://raw.githubusercontent.com/$repo/$branch/$file_path"
    url=${url// /%20}
    mkdir -p "$dest_dir/$subdir_name"
    curl -fsSL "$url" > "$dest_dir/$subdir_name/$file_name"
    echo "$dest_dir/$subdir_name/$file_name"
    show_image "$dest_dir/$subdir_name/$file_name"
}

show_image() {
    # Check if the script is running in a terminal
    if [ -t 1 ]; then
        if command -v viu &> /dev/null; then
            viu "$1"
        else
            echo "Do you want to view the wallpaper? (y/n)"
            read -r response
            if [[ $response == "y" ]]; then
                xdg-open "$1"
            fi
            exit 1
        fi
    fi
}

# Function to fetch wallpapers from repositories and process selection
fetch_and_process_wallpapers() {
    local selector="$1"
    IFS=: read -r repo branch file_path <<< $(
    for repo_branch in "${repositories[@]}"; do
        repo_branch=(${repo_branch//:/ })  # Split repository and branch
        repo=${repo_branch[0]}
        branch=${repo_branch[1]}
        tree_url="https://api.github.com/repos/$repo/git/trees/$branch?recursive=1"
        file_list=$(curl -s "$tree_url" | jq -r '.tree[] | select(.type == "blob") | .path' | grep -E '\.(jpeg|jpg|png|gif|webp)$')
        IFS=$'\n'
        for file_path in $file_list; do
            echo "$repo:$branch:$file_path"
        done
        IFS=' '
    done | eval "$selector")
    download_and_save "$repo" "$branch" "$file_path"
}

# Check the mode and select a repository
if [[ $mode == "random" ]]; then
    # Generate a random number between 0 and 1 to select a repository
    random_index=$(( RANDOM % ${#repositories[@]} ))
    repo_branch=(${repositories[$random_index]//:/ })  # Split repository and branch
    repo=${repo_branch[0]}
    branch=${repo_branch[1]}
    tree_url="https://api.github.com/repos/$repo/git/trees/$branch?recursive=1"
    file_list=$(curl -s "$tree_url" | jq -r '.tree[] | select(.type == "blob") | .path' | grep -E '\.(jpeg|jpg|png|gif|webp)$')
    random_file_path=$(echo -e "$file_list" | shuf -n 1)
    download_and_save "$repo" "$branch" "$random_file_path"
elif [[ $mode == "fzf" ]]; then
    fetch_and_process_wallpapers "fzf"
elif [[ $mode == "rofi" ]]; then
    fetch_and_process_wallpapers "rofi -dmenu -config ~/dots/rofi/config-dmenu.rasi -i -p 'Select a wallpaper' -theme-str 'window{ width: 60%; height: 40%; }'" 

fi
