# == MY ARCH SETUP INSTALLER == #
set -x 
set -e
#part1
printf '\033c'
echo "Welcome to sawhill's arch installer script (using bugswriter's script as a base)"
sed -i "s/^#ParallelDownloads = 5$/ParallelDownloads = 15/" /etc/pacman.conf
#reflector --country 'IN' --latest 50 --sort rate --save /etc/pacman.d/mirrorlist
pacman --noconfirm -Sy archlinux-keyring
loadkeys us
timedatectl set-ntp true
lsblk
echo "Enter the drive: "
read drive
cfdisk $drive 

echo "Enter the linux root partition: "
read root_partition
mkfs.ext4 -L ROOT $root_partition

echo "Enter the linux home partition: "
read home_partition
mkfs.ext4 -L HOME $home_partition 

echo "Enter the swap partition: "
read swap_partition 
mkswap -L SWAP $swap_partition 

read -p "Did you also want to create efi partition? [y/n]" answer
if [[ $answer = y ]] ; then
  echo "Enter EFI partition: "
  read efi_partition
  mkfs.fat -F 32 -n BOOT $efi_partition
fi

mount $root_partition /mnt 
mount --mkdir $home_partition /mnt/home
mount --mkdir $efi_partition /mnt/boot/EFI
swapon $swap_partition

pacstrap /mnt base linux linux-firmware
genfstab -L /mnt >> /mnt/etc/fstab
sed '1,/^#part2$/d' `basename $0` > /mnt/arch_install2.sh
chmod +x /mnt/arch_install2.sh
arch-chroot /mnt ./arch_install2.sh
exit 

#part2
set -x
set -e
printf '\033c'
pacman -S --noconfirm sed curl
sed -i "s/^#ParallelDownloads = 5$/ParallelDownloads = 15/" /etc/pacman.conf
ln -sf /usr/share/zoneinfo/Asia/Kolkata /etc/localtime
hwclock --systohc
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
echo "KEYMAP=us" > /etc/vconsole.conf
echo "Hostname: "
read hostname
echo $hostname > /etc/hostname
echo "127.0.0.1       localhost" >> /etc/hosts
echo "::1             localhost" >> /etc/hosts
echo "127.0.1.1       $hostname.localdomain $hostname" >> /etc/hosts
echo "Set root password"
passwd
pacman --noconfirm -S grub efibootmgr os-prober
mkdir -p /boot/EFI
grub-install --target=x86_64-efi --efi-directory=/boot/EFI --bootloader-id=$hostname
sed -i 's/quiet/pci=noaer/g' /etc/default/grub
grub-mkconfig -o /boot/grub/grub.cfg

curl -fsSL https://raw.githubusercontent.com/Sahil-958/dots/main/package_list_control/pkglist_hooks_generated.txt > pkglist.txt ||echo "amd-ucode ark base base-devel bash-completion blueman bluez-utils breeze breeze-gtk breeze-icons brightnessctl btop calibre cliphist cmatrix cmus dmenu dolphin dolphin-plugins dunst efibootmgr ffmpegthumbs firefox firewalld fzf gammastep git glava grim grub grub-btrfs gwenview hyprland imagemagick imlib2 jq konsole linux linux-firmware man-db mesa-utils neofetch neovim nethogs network-manager-applet networkmanager noto-fonts-emoji os-prober pavucontrol pipewire-pulse polkit-kde-agent python-pyqt5 python-pywal python-qrencode qbittorrent qpdf qt5-graphicaleffects qt5-quickcontrols qt5-quickcontrols2 qt5ct qt6-wayland qt6ct reflector rofi sddm slurp snapper starship swappy sxiv terminus-font tldr tree ttf-fira-sans unzip vi vim viu vlc waybar wl-clipboard xautolock xclip xdg-desktop-portal-hyprland xf86-video-amdgpu xf86-video-ati xf86-video-nouveau xorg-server xorg-xbacklight xorg-xev xorg-xinit xorg-xkill xorg-xprop xorg-xsetroot yt-dlp zip" > pkglist.txt


sed -i '/grub-btrfs/d' pkglist.txt
pacman -S --noconfirm --needed - < pkglist.txt

echo "%wheel ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
echo -n "Enter Username: "
read username
useradd -m -G wheel -s /bin/bash $username
passwd $username
echo "Pre-Installation Finish Reboot now"
ai3_path=/home/$username/arch_install3.sh
sed '1,/^#part3$/d' arch_install2.sh > $ai3_path
chown $username:$username $ai3_path
chmod +x $ai3_path
echo  "Sleeping 50sec so you can exit by pressing CTRL-C and reboot"
sleep 50

#part3
set -x
set -e
printf '\033c'
cd $HOME
sudo systemctl enable --now NetworkManager.service
sudo systemctl enable sddm.service
nmtui

echo " %wheel ALL=(ALL:ALL) ALL" | sudo tee -a  /etc/sudoers
git clone  --depth=1 https://github.com/Sahil-958/dots.git
#find ~/dots -type f  -not -path "*.git*" -exec sed -i "s/sawhill/$USER/g" {} +

# pikaur: AUR helper
git clone https://aur.archlinux.org/pikaur.git
cd pikaur
makepkg -fsri
cd

curl -fsSL https://raw.githubusercontent.com/Sahil-958/dots/main/package_list_control/pkglist_forgien_hooks_generated.txt > foregien_pkgs.txt ||echo "librewolf-bin oomox-qt5-styleplugin-git pikaur swaylock-effects-git swww themix-full-git vscodium-bin wlogout" > foregien_pkgs.txt
sed -i '/pikaur/d' foregien_pkgs.txt
pkgs=$(tr '\n' ' ' < foregien_pkgs.txt)

set +e
pikaur -S $pkgs
cd
set -e
mkdir -p Desktop Downloads Documents Music Pictures Videos .local/share
git clone --depth=1 https://github.com/Sahil-958/walls.git 
git clone --depth=1 https://github.com/Sahil-958/apexNotificationSounds.git  ~/Music/apexNotificationSounds

echo "making symlinks"
cd dots
set +e
sudo ln -sf ~/dots/wal ~/.config/
~/dots/hypr/scripts/wallpaper.sh random
sudo ln -sf ~/dots/package_list_control/packgae_update.sh /usr/bin
sudo mkdir -p /etc/pacman.d/hooks
sudo ln -sf ~/dots/package_list_control/update_package_list.hook /etc/pacman.d/hooks/
sudo ln -sf ~/dots/package_list_control/pkglist_hooks_generated.txt /etc/pacman.d/hooks/
sudo ln -sf ~/dots/package_list_control/pkglist_forgien_hooks_generated.txt /etc/pacman.d/hooks/
sudo ln -sf ~/dots/hypr ~/.config/
sudo ln -sf ~/dots/waybar ~/.config/
sudo ln -sf ~/dots/rofi ~/.config/
sudo ln -sf ~/dots/wlogout ~/.config/
sudo ln -sf ~/dots/gammastep ~/.config/
sudo ln -sf ~/dots/gtk-3.0 ~/.config/
sudo ln -sf ~/dots/gtk-4.0 ~/.config/
sudo ln -sf ~/dots/gtkrc-2.0 ~/.config/
sudo ln -sf ~/dots/gtkrc-2.0 ~/.gtkrc-2.0
sudo ln -sf ~/dots/gtkrc ~/.config/
sudo ln -sf ~/dots/swappy ~/.config/
sudo ln -sf ~/dots/glava ~/.config/
sudo ln -sf ~/.cache/wal/bars.glsl ~/dots/glava/
sudo ln -sf ~/.cache/wal/circle.glsl ~/dots/glava/
sudo ln -sf ~/.cache/wal/graph.glsl ~/dots/glava/
sudo ln -sf ~/.cache/wal/wave.glsl ~/dots/glava/
sudo ln -sf ~/dots/dunst ~/.config/
sudo ln -sf ~/.cache/wal/dunstrc ~/dots/dunst/ 
sudo ln -sf ~/dots/mimeapps.list ~/.config/
sudo ln -sf ~/dots/swappy ~/.config/
sudo ln -sf ~/dots/swaylock ~/.config/
sudo mkdir -p /etc/udev/rules.d
sudo ln -sf ~/dots/powerNotify/99-bat.rules /etc/udev/rules.d/
sudo ln -sf ~/.cache/wal/colors-konsole.colorscheme ~/dots/konsole/pywal.colorscheme
sudo ln -sf ~/dots/konsolerc ~/.config/
sudo ln -sf ~/dots/konsole ~/.local/share/
sudo cp -r ~/dots/fonts /usr/share/fonts
sudo cp -r ~/dots/sddm_theme_sugar_candy/ /usr/share/sddm/themes/sugar_candy
sudo cp ~/dots/sddm.conf /etc/
sudo ln -sf ~/dots/.inputrc ~/
sudo ln -sf ~/dots/.bashrc ~/
sudo ln -sf ~/dots/.gitconfig ~/
sudo ln -sf ~/dots/.vimrc ~/
sudo ln -sf ~/dots/qt5ct ~/.config/
sudo ln -sf ~/dots/qt6ct ~/.config/
rm -rf ~/.icons
sudo cp -r ~/dots/.icons ~/  
echo "
[Icon Theme]
Inherits=breeze_cursors
" | sudo tee /usr/share/icons/default/index.theme
sudo cp ~/dots/environment /etc/
sudo cp ~/dots/grub /etc/default/
sudo grub-mkconfig -o /boot/grub/grub.cfg
sudo cp ~/dots/mkinitcpio.conf /etc/
sudo mkinitcpio -P

echo "/* Always authenticate Admins by prompting for the root
 * password, similar to the rootpw option in sudo
 */
polkit.addAdminRule(function(action, subject) {
    return ["unix-user:root"];
});" | sudo tee /etc/polkit-1/rules.d/49-rootpw_global.rules

echo "don't foreget to change default password of the user created which is same as username"

exit
