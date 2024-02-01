#UPDATE DUNST COLORS AND RESTART

# ----------------------------------------------------- 
# Reload waybar with new colors
# -----------------------------------------------------
~/dots/waybar/launch.sh

# ----------------------------------------------------- 
# Generate the new gtk,qt etc with oomox file with new colors
# -----------------------------------------------------
~/dots/scripts/genQTGTK.sh &

# ----------------------------------------------------- 
# Generate the starship.toml file with new colors
# -----------------------------------------------------
~/dots/scripts/waltostarship.sh

#dunst=$(themix-base16-cli /opt/oomox/plugins/base16/templates/dunst/templates/custom.mustache /opt/oomox/plugins/base16/schemes/py/py.yaml |grep -Ev "ERROR|Image plugin") 
#echo "$dunst" > ~/dots/dunst/pydunstrc
#killall dunst; cat ~/dots/dunst/dunstrc ~/dots/dunst/pydunstrc |dunst -conf - &


#ROFI THEME COLORS UPDATES
#themix-base16-cli /opt/oomox/plugins/base16/templates/rofi/templates/custom.mustache /opt/oomox/plugins/base16/schemes/py/py.yaml |grep -Ev "ERROR|Image plugin" > ~/dots/rofi/pywal.rasi

#NOT USING THEMEIX BASE 16 USING PYWAL TEMPLATES INSTEAD
killall dunst; dunst &

#SDDM THEME UPDATE

source /home/sawhill/.cache/wal/colors.sh

cat $wallpaper > /usr/share/sddm/themes/sugar_candy/Backgrounds/Background.png

sed -i "s/^Background=.*$/Background=\"Backgrounds\/Background.png\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/MainColor=.*$/MainColor=\"$foreground\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/AccentColor=.*$/AccentColor=\"$color14\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/BackgroundColor=.*$/BackgroundColor=\"$background\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/OverrideLoginButtonTextColor=.*$/OverrideLoginButtonTextColor=\"$background\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf

# Check if glava is running if running restart it 
pgrep glava && killall glava && glava


# Using direct symlink: ln -s ~/.cache/wal/swaylock ~/.config/swaylock/config
# -----------------------------------------------------
# Generate Swaylock config with new colors
# -----------------------------------------------------
#~/dots/scripts/swaylock.sh

#or just use sed as below

#source /home/sawhill/.cache/wal/colors-swaylock.sh
# Update swaylock config colors and wallpaper
#sed -i "s|image=.*$|image=$wallpaper|g" ~/.config/swaylock/config
#sed -i "s|ring-color=.*$|ring-color=$foreground|g" ~/.config/swaylock/config
#sed -i "s|ring-clear-color=.*$|ring-clear-color=$foreground|g" ~/.config/swaylock/config
#sed -i "s|ring-ver-color=.*$|ring-ver-color=$foreground|g" ~/.config/swaylock/config
#sed -i "s|ring-wrong-color=.*$|ring-wrong-color=$foreground|g" ~/.config/swaylock/config
#
#sed -i "s|line-caps-color=.*$|line-caps-color=${foreground}A0|g" ~/.config/swaylock/config
#sed -i "s|line-clear-color=.*$|line-clear-color=${foreground}A0|g" ~/.config/swaylock/config
#sed -i "s|line-ver-color=.*$|line-ver-color=${foreground}A0|g" ~/.config/swaylock/config
#sed -i "s|line-wrong-color=.*$|line-wrong-color=${foreground}A0|g" ~/.config/swaylock/config
#
#sed -i "s|text-color=.*$|text-color=${foreground}|g" ~/.config/swaylock/config
#sed -i "s|text-clear-color=.*$|text-clear-color=${foreground}|g" ~/.config/swaylock/config
#sed -i "s|text-ver-color=.*$|text-ver-color=${foreground}|g" ~/.config/swaylock/config
#sed -i "s|text-wrong-color=.*$|text-wrong-color=${foreground}|g" ~/.config/swaylock/config
#
#sed -i "s|bs-hl-color=.*$|bs-hl-color=${foreground}|g" ~/.config/swaylock/config
#sed -i "s|text-caps-lock-color=.*$|text-caps-lock-color=${foreground}|g" ~/.config/swaylock/config
