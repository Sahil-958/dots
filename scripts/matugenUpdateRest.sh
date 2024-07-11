# ----------------------------------------------------- 
# Generate the starship.toml file with new colors
# -----------------------------------------------------
~/dots/scripts/matugenWallToStarship.sh arrow

#SDDM THEME UPDATE

#source /home/sawhill/.cache/wal/colors.sh
source /home/sawhill/.cache/matugen/colors.sh

cat "$wallpaper" > /usr/share/sddm/themes/sugar_candy/Backgrounds/Background.png

sed -i "s/^Background=.*$/Background=\"Backgrounds\/Background.png\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/MainColor=.*$/MainColor=\"$primary\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/AccentColor=.*$/AccentColor=\"$secondary\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/BackgroundColor=.*$/BackgroundColor=\"$background\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf
sed -i "s/OverrideLoginButtonTextColor=.*$/OverrideLoginButtonTextColor=\"$background\"/g" /usr/share/sddm/themes/sugar_candy/theme.conf

# Check if glava is running if running restart it 
pgrep glava && killall glava && glava & disown
