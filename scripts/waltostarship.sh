#!/bin/bash
source ~/.cache/wal/colors.sh
#a3aed2 as color8
#090c0c as foreground done
#c9cbff as color 7 done
#394260 as color 14 done
#2e374c as color 3 done
#212736 as color3 done
#6c7086 as color 9 done
#4c4f69 as color 2 done
#f38ba8 as color 13
#a0a9cb as color 1 
#


output=$(cat <<EOF
format = """
[░▒▓]($color8)\\
[  ](bg:$color8 fg:$foreground)\\
\$sudo\\
[](bg:$color7 fg:$color8)\\
\$username\\
\$hostname\\
\$directory\\
[](fg:$color7 bg:$color14)\\
\$git_branch\\
\$git_status\\
[](fg:$color14 bg:$color3)\\
\$nodejs\\
\$rust\\
\$golang\\
\$php\\
[](fg:$color3 bg:$color9)\\
\$time\\
[](fg:$color9)\\
\\\n\$character\\
"""

right_format="""
[](fg:$color7 bg:transparent)\\
\$status\\
[](fg:$color7 bg:transparent)\\
"""
add_newline = false

[character]
#success_symbol = '[❯](#00ff00) '
#error_symbol = '[❯](#ff0000)'
success_symbol = '[❯]($foreground)'
error_symbol = '[❯](#ff0000)'

[username]
style_user = 'fg:$color2 bg:$color7'
style_root = 'black bold'
format = '[\$user](\$style)'
disabled = false
show_always = true

[hostname]
ssh_only = false
format = '[\$ssh_symbol](bold blue)[@\$hostname:](fg:$color2 bg:$color7)'
trim_at = '.'
ssh_symbol = '󰣀'
disabled = false

[sudo]
format ='[\$symbol](\$style)'
style = 'bg:$color8 fg:$foreground'
symbol = '󰚌 '
disabled = false

[directory]
style = "fg:$color2 bg:$color7"
before_repo_root_style = "fg:$color2 bg:$color7"
repo_root_style="fg:$color2 bg:$color7"
read_only= "󰉑"
read_only_style= "bg:$color13"
format = "[\$path](\$style)[\$read_only](\$read_only_style)"
repo_root_format="[\$before_root_path](\$before_repo_root_style)[\$repo_root](\$repo_root_style)[\$path  ](\$style)[\$read_only](\$read_only_style)"
truncation_length = 6
truncation_symbol = "…/"
truncate_to_repo = false

[directory.substitutions]
"Documents" = "󰈙 "
"Downloads" = " "
"Music" = "󰽰 "
"Pictures" = " "


[git_branch]
symbol = "󰘬"
style = "bg:$color14"
format = '[[ \$symbol \$branch ](fg:$color7 bg:$color14)](\$style)'

[git_status]
style = "bg:$color14"
format = '[[(\$all_status\$ahead_behind )](fg:$color7 bg:$color14)](\$style)'
#added by me
conflicted = ' 🏳 '
ahead = '󰵵🏎 ⇡\${count}'
behind = '󰱬 ⇣\${count}'
diverged = '󰚛 ⇕⇡\${ahead_count}⇣\${behind_count}'
up_to_date = ' ✓ '
untracked = '  '
stashed = ' 📦 '
modified = ' 󰷉 '
staged = '[++\(\$count\)](green)'
renamed = ' 󰇹 '
deleted = ' 🗑 '

[nodejs]
symbol = ""
style = "bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[rust]
symbol = ""
style = "bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[golang]
symbol = ""
style = "bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[php]
symbol = ""
style = "bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[time]
disabled = false
time_format = "%A %d %b %I:%M %P" # Hour:Minute Format
style = "bg:$color9"
format = '[[  \$time ](fg:$color14 bg:$color9)](\$style)'

[status]
style = 'fg:$color2 bg:$color7'
symbol = ''
success_symbol = ''
format = '[ \$symbol \$common_meaning\$signal_name\$maybe_int](\$style)'
map_symbol = true
disabled = false
EOF
)

#echo "$output" 
printf "%b\n" "$output" > ~/dots/scripts/generatedStarship.toml
