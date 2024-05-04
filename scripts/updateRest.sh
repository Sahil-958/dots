#UPDATE DUNST COLORS AND RESTART

# ----------------------------------------------------- 
# Reload waybar with new colors
# -----------------------------------------------------
#~/dots/waybar/launch.sh
pkill -USR2 waybar

# ----------------------------------------------------- 
# Generate the new gtk,qt etc with oomox file with new colors
# -----------------------------------------------------
~/dots/scripts/genQTGTK.sh &

# ----------------------------------------------------- 
# Generate the starship.toml file with new colors
# -----------------------------------------------------
~/dots/scripts/waltostarship.sh arrow

#dunst=$(themix-base16-cli /opt/oomox/plugins/base16/templates/dunst/templates/custom.mustache /opt/oomox/plugins/base16/schemes/py/py.yaml |grep -Ev "ERROR|Image plugin") 
#echo "$dunst" > ~/dots/config/dunst/pydunstrc
#killall dunst; cat ~/dots/config/dunst/dunstrc ~/dots/config/dunst/pydunstrc |dunst -conf - &


#ROFI THEME COLORS UPDATES
#themix-base16-cli /opt/oomox/plugins/base16/templates/rofi/templates/custom.mustache /opt/oomox/plugins/base16/schemes/py/py.yaml |grep -Ev "ERROR|Image plugin" > ~/dots/config/rofi/pywal.rasi

#NOT USING THEMEIX BASE 16 USING PYWAL TEMPLATES INSTEAD
#killall dunst; dunst &
swaync-client -rs

#SDDM THEME UPDATE

source /home/sawhill/.cache/wal/colors.sh

cat "$wallpaper" > /usr/share/sddm/themes/sugar_candy/Backgrounds/Background.png

sed -i "s/^Background=.*$/Background=\"Backgrounds\/Background.png\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/MainColor=.*$/MainColor=\"$foreground\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/AccentColor=.*$/AccentColor=\"$color14\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/BackgroundColor=.*$/BackgroundColor=\"$background\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/OverrideLoginButtonTextColor=.*$/OverrideLoginButtonTextColor=\"$background\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf

# Check if glava is running if running restart it 
pgrep glava && killall glava && glava &


# Using direct symlink: ln -s ~/.cache/wal/swaylock ~/.config/swaylock/config
# -----------------------------------------------------
# Generate Swaylock config with new colors
# -----------------------------------------------------
#~/dots/config/scripts/swaylock.sh

