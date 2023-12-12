#UPDATE DUNST COLORS AND RESTART

dunst=$(themix-base16-cli /opt/oomox/plugins/base16/templates/dunst/templates/custom.mustache /opt/oomox/plugins/base16/schemes/py/py.yaml |grep -Ev "ERROR|Image plugin") 
echo "$dunst" > ~/dots/dunst/pydunstrc
killall dunst; cat ~/dots/dunst/dunstrc ~/dots/dunst/pydunstrc |dunst -conf - &


#ROFI THEME COLORS UPDATES
themix-base16-cli /opt/oomox/plugins/base16/templates/rofi/templates/custom.mustache /opt/oomox/plugins/base16/schemes/py/py.yaml |grep -Ev "ERROR|Image plugin" > ~/dots/rofi/pywal.rasi


