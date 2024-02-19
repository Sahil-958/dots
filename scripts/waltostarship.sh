#!/bin/bash
source ~/.cache/wal/colors.sh
case $1 in
    round)
        icon=""
        icon1=""
        ;; 
    backslash)
        icon=""
        icon1=""
        ;;
    arrow)
        icon="" 
        icon1=""
        ;;  
    slash)
        icon=""
        icon1=""
        ;;
    pixelated) 
        icon=""
        icon1="" 
        ;;
    *)
        icon=""
        icon1=""
        ;;
esac

output=$(cat <<EOF
format = """
[░▒▓]($color8)\\
[  ](bg:$color8 fg:$foreground)\\
\$sudo\\
[$icon1](bg:$color7 fg:$color8)\\
\$username\\
\$hostname\\
\$directory\\
[$icon1](fg:$color7 bg:$color14)\\
\$git_branch\\
\$git_status\\
[$icon](fg:$color14 bg:$color3)\\
\$buf\\
\$bun\\
\$c\\
\${custom.cpp}\\
\${custom.c_sharp}\\
\$cmake\\
\$cobol\\
\$crystal\\
\$daml\\
\$dart\\
\$deno\\
\$dotnet\\
\$elixir\\
\$elm\\
\$erlang\\
\$fennel\\
\$golang\\
\$haskell\\
\$helm\\
\$java\\
\$julia\\
\$kotlin\\
\$lua\\
\$nim\\
\$nodejs\\
\$ocaml\\
\$opa\\
\$package\\
\$perl\\
\$php\\
\$purescript\\
\$python\\
\$raku\\
\$red\\
\$rlang\\
\$ruby\\
\$rust\\
\$scala\\
\$swift\\
\$typst\\
\$vagrant\\
\$vlang\\
\$zig\\
[$icon](fg:$color3 bg:$color9)\\
\$time\\
[$icon](fg:$color9)\\
\\\n\$character\\
"""

add_newline = false
continuation_prompt = '[❯❯]($foreground)'

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
read_only= " 󰉑 "
read_only_style= "bg:$color7 fg:$color2"
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

[time]
disabled = false
time_format = "%A %d %b %I:%M %P " # Hour:Minute Format
style = "bg:$color9"
format = '[[ \$time](fg:$color14 bg:$color9)](\$style)'

[status]
style = 'fg:$color2 bg:$color7'
symbol = ''
success_symbol = ''
format = '[ \$symbol \$common_meaning\$signal_name\$maybe_int](\$style)'
map_symbol = true
disabled = false

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

[buf]
symbol="buf"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[bun]
symbol="󰳯 "
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[c]
symbol="󰙱 "
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[custom.cpp]
disabled=false
symbol=""
extensions=["cpp"]
style="bg:$color3"
command='cpp --version | head -n 1 | grep -oP "\d+\.\d+\.\d+"'
format = '[[ \$symbol (\$output) ](fg:$color7 bg:$color3)](\$style)'

[custom.c_sharp]
disabled=false
symbol=" "
extensions=["cs"]
style="bg:$color3"
command='csc --version | head -n 1 | grep -oP "\d+\.\d+\.\d+"'
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[cmake]
symbol="cmake"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[cobol]
symbol="COBOL"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[crystal]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[daml]
symbol=" daml"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[dart]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[deno]
symbol="deno"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[dotnet]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[elixir]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[elm]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[erlang]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[fennel]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[haskell]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[helm]
symbol="󰠳 helm"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[java]
symbol="󰬷"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[julia]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[kotlin]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[lua]
symbol="󰢱"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[nim]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[ocaml]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[opa]
symbol="󰵰"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[package]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[perl]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[purescript]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[python]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[raku]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[red]
symbol="󱥒 red"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[rlang]
symbol="rlang"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[ruby]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[scala]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[swift]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[typst]
symbol="typst"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[vagrant]
symbol=" vagrant"
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[vlang]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

[zig]
symbol=""
style="bg:$color3"
format = '[[ \$symbol (\$version) ](fg:$color7 bg:$color3)](\$style)'

EOF
)

#echo "$output" 
printf "%b\n" "$output" > ~/.config/starship.toml
