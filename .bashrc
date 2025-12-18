#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return
source /usr/share/nvm/init-nvm.sh
alias ls='ls --color=auto'
alias grep='grep --color=auto'
# neovim with custom lazyvim config alias
alias lvim='XDG_CONFIG_HOME=$HOME/lvim/ nvim'

#To avoid duplicate commands in History
export HISTCONTROL=ignoredups
export HISTSIZE=10000
#When resizing a terminal emulator, Bash may not receive the resize signal. This will cause typed text to not wrap correctly and overlap the prompt. The checkwinsize shell option checks the window size after each command and, if necessary, updates the values of LINES and COLUMNS.
shopt -s checkwinsize

fcd() {
  cd "$(find -type d | fzf)"
}

fhcd() {
  cd "$(find ~ -type d | fzf)"
}

frcd() {
  cd "$(sudo find / -type d -not -path '*snapshot*' | fzf)"
}

open() {
  xdg-open "$(find -type f | fzf)"
}

edit() {
  vim "$(find -type f | fzf)"
}

openh() {
  xdg-open "$(find ~ -type f | fzf)"
}

openr() {
  xdg-open "$(find / -type f | fzf)"
}

snapr() {
  sudo snapper -c root create -d "$1" -u "important=yes"
}

snaph() {
  sudo snapper -c home create -d "$1" -u "important=yes"
}

snapl() {
  sudo snapper -c "$1" list
}

hc() {
  local selectedCommand

  selectedCommand=$(history | sed "s/^[ \t]*[0-9]\+[ \t]*//" | sort -u | fzf --reverse --height=60%)
  echo "Copying $selectedCommand "

  if [ "$XDG_SESSION_TYPE" = "wayland" ]; then
    echo "$selectedCommand" | wl-copy && echo "Command Copied Successfully"
  else
    echo "$selectedCommand" | xclip -selection clipboard && echo "Command Copied Successfully"
  fi
}

stats() {
  echo "╔══════════════════════════════╗"
  echo "║  Top 10 Most Used Commands   ║"
  echo "╠══════════════════════════════╣"
  history | awk '{a[$2]++}END{for(i in a){print a[i] " " i}}' | sort -rn | head -10 | awk '{print "║ " NR". " $2 "\t║\t" $1 " times\t║"}' | column -t -s $'\t' && echo "╚══════════════════════════════╝"

}
alias hr='history | sed "s/^[ \t]*[0-9]\+[ \t]*//"| sort -u | fzf --reverse --height=60% |bash'

#Souring the below does the same as the command_not_found_handle does but i can customize the funtion to my likings
#source /usr/share/doc/pkgfile/command-not-found.bash
command_not_found_handle() {
  echo "$1 Command Not Found! Run cnf $1 To search"
}

cnf() {
  pacman -F "$1"
}

up() {
  if [ -z "$1" ]; then
    echo "Usage: sharefile <file_to_upload>"
    return 1
  fi

  local file_path="$1"
  local filename
  filename="$(basename "$file_path")"

  if [ ! -f "$file_path" ]; then
    echo "Error: File not found: $file_path"
    return 1
  fi

  if ! command -v qrencode >/dev/null 2>&1; then
    echo "Note: install qrencode for QR output:"
    echo "  sudo pacman -S qrencode"
  fi

  echo "📤 Uploading: $file_path"
  echo "------------------------------------"

  # **Multiple known-reliable upload providers**
  declare -A services=(
    ["file.io"]="curl --silent -F file=@\"$file_path\" https://file.io"
    ["oshi.at"]="curl --silent -T \"$file_path\" https://oshi.at"
    ["0x0.st"]="curl --silent -F file=@\"$file_path\" https://0x0.st"
    ["transfer.sh"]="curl --silent --upload-file \"$file_path\" https://transfer.sh/\"$filename\""
    ["tmpfiles.org"]="curl --silent -F file=@\"$file_path\" https://tmpfiles.org/api/v1/upload"
  )

  local response=""
  local url=""

  for name in "${!services[@]}"; do
    echo "Trying: $name"
    response=$(eval "${services[$name]}")

    # Extract URLs from JSON or plain text:
    if [[ "$response" =~ https?://[a-zA-Z0-9./?=_-]+ ]]; then
      url="${BASH_REMATCH[0]}"
      echo "✔ Success via $name"
      break
    fi

    echo "✖ Failed on $name"
  done

  if [[ -z "$url" ]]; then
    echo "❌ All services failed."
    return 1
  fi

  echo ""
  echo "🔗 Download URL:"
  echo "$url"
  echo ""

  if command -v qrencode >/dev/null 2>&1; then
    echo "📱 QR Code:"
    qrencode -t ANSIUTF8 "$url"
  fi

  echo "------------------------------------"
}

#PS1='[\u@\h \W]\$ '
#Starship function to generate the custom prompt
eval "$(starship init bash)"
alias kref="qdbus org.kde.KWin /KWin reconfigure"
# Added path to access scripts more easily
export PATH="$HOME/dots/scripts:$PATH"
export PATH="/home/sawhill/.local/bin:$PATH"
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock
export WINAPPS_SRC_DIR="$HOME/.local/bin/winapps-src"
