#!/bin/bash
source ~/.cache/matugen/colors.sh
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
[░▒▓]($primary)\\
[  ](bg:$primary fg:$on_primary)\\
\$sudo\\
[$icon1](fg:$primary bg:$primary_container)\\
\$username\\
\$hostname\\
\$directory\\
[$icon1](fg:$primary_container bg:$secondary)\\
\$git_branch\\
\$git_status\\
[$icon](fg:$secondary bg:$secondary_container)\\
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
[$icon](fg:$secondary_container bg:$surface)\\
\$time\\
[$icon](fg:$surface)\\
\\\n\$character\\
"""

add_newline = false
continuation_prompt = '[❯❯]($foreground)'

[character]
#success_symbol = '[❯](#00ff00) '
#error_symbol = '[❯](#ff0000)'
success_symbol = '[❯]($foreground)'
error_symbol = '[❯](#ff0000)'

[sudo]
format ='[\$symbol](\$style)'
style = 'bg:$primary fg:$on_primary'
symbol = '󰚌 '
disabled = false

[username]
style_user = 'fg:$on_primary_container bg:$primary_container'
style_root = 'black bold'
format = '[\$user](\$style)'
disabled = false
show_always = true

[hostname]
ssh_only = false
format = '[\$ssh_symbol](bold blue)[@\$hostname:](fg:$on_primary_container bg:$primary_container)'
trim_at = '.'
ssh_symbol = '󰣀'
disabled = false

[directory]
style = "fg:$on_primary_container bg:$primary_container"
before_repo_root_style = "fg:$on_primary_container bg:$primary_container"
repo_root_style="fg:$on_primary_container bg:$primary_container"
read_only= " 󰉑 "
read_only_style= "bg:$primary_container fg:$on_primary_container"
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
style = "bg:$secondary"
format = '[[ \$symbol \$branch ](fg:$on_secondary bg:$secondary)](\$style)'

[git_status]
style = "bg:$secondary"
format = '[[(\$all_status\$ahead_behind )](fg:$on_secondary bg:$secondary)](\$style)'
#added by me
conflicted = ' 🏳 '
ahead = '󰵵🏎 ⇡\${count}'
behind = '󰱬 ⇣\${count}'
diverged = '󰚛 ⇕⇡\${ahead_count}⇣\${behind_count}'
up_to_date = ' ✓ '
untracked = '  '
stashed = ' 📦 '
modified = ' 󰷉 '
staged = '[++\(\$count\)](fg:$on_secondary bg:$secondary)'
renamed = ' 󰇹 '
deleted = ' 🗑 '

[time]
disabled = false
time_format = "%A %d %b %I:%M %P " # Hour:Minute Format
style = "bg:$surface"
format = '[[ \$time](fg:$primary bg:$surface)](\$style)'

[status]
style = 'fg:$color2 bg:$on_primary'
symbol = ''
success_symbol = ''
format = '[ \$symbol \$common_meaning\$signal_name\$maybe_int](\$style)'
map_symbol = true
disabled = false

[nodejs]
symbol = ""
style = "bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[rust]
symbol = ""
style = "bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[golang]
symbol = ""
style = "bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[php]
symbol = ""
style = "bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[buf]
symbol="buf"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[bun]
symbol="󰳯 "
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[c]
symbol="󰙱 "
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[custom.cpp]
disabled=false
symbol=""
extensions=["cpp"]
style="bg:$secondary_container"
command='cpp --version | head -n 1 | grep -oP "\d+\.\d+\.\d+"'
format = '[[ \$symbol (\$output) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[custom.c_sharp]
disabled=false
symbol=" "
extensions=["cs"]
style="bg:$secondary_container"
command='csc --version | head -n 1 | grep -oP "\d+\.\d+\.\d+"'
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[cmake]
symbol="cmake"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[cobol]
symbol="COBOL"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[crystal]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[daml]
symbol=" daml"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[dart]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[deno]
symbol="deno"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[dotnet]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[elixir]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[elm]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[erlang]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[fennel]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[haskell]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[helm]
symbol="󰠳 helm"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[java]
symbol="󰬷"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[julia]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[kotlin]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[lua]
symbol="󰢱"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[nim]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[ocaml]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[opa]
symbol="󰵰"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[package]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[perl]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[purescript]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[python]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[raku]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[red]
symbol="󱥒 red"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[rlang]
symbol="rlang"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[ruby]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[scala]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[swift]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[typst]
symbol="typst"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[vagrant]
symbol=" vagrant"
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[vlang]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

[zig]
symbol=""
style="bg:$secondary_container"
format = '[[ \$symbol (\$version) ](fg:$on_secondary_container bg:$secondary_container)](\$style)'

EOF
)

#echo "$output" 
printf "%b\n" "$output" > ~/.config/starship.toml
