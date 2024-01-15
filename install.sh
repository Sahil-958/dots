# == MY ARCH SETUP INSTALLER == #
#part1
printf '\033c'
echo "Welcome to sawhill's arch installer script (using bugswriter's script as a base)"
sed -i "s/^#ParallelDownloads = 5$/ParallelDownloads = 15/" /etc/pacman.conf
pacman --noconfirm -Sy archlinux-keyring
loadkeys us
timedatectl set-ntp true
lsblk
echo "Enter the drive: "
read drive
cfdisk $drive 

echo "Enter the linux root partition: "
read root_partition
mkfs.btrfs $root_partition
btrfs filesystem label $root_partition ROOT 

echo "Enter the linux home partition: "
read home_partition
mkfs.btrfs $home_partition 
btrfs filesystem label $home_partition HOME

echo "Enter the swap partition: "
read swap_partition 
mkswap -L SWAP $swap_partition 

read -p "Did you also want to create efi partition? [y/n]" answer
if [[ $answer = y ]] ; then
  echo "Enter EFI partition: "
  read efi_partition
  mkfs.vfat -F 32 -n BOOT $efi_partition
fi

mount $root_partition /mnt 
mount --mkdir $home_partition /mnt/home
mount --mkdir $efi_partition /mnt/boot
swapon $swap_partition

pacstrap /mnt base base-devel linux linux-firmware
genfstab -L /mnt >> /mnt/etc/fstab
sed '1,/^#part2$/d' `basename $0` > /mnt/arch_install2.sh
chmod +x /mnt/arch_install2.sh
arch-chroot /mnt ./arch_install2.sh
exit 

#part2
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
mkinitcpio -P
passwd
pacman --noconfirm -S grub efibootmgr os-prober
echo "Enter EFI partition: " 
read efipartition
mkdir /boot/efi
mount $efipartition /boot/efi 
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB
sed -i 's/quiet/pci=noaer/g' /etc/default/grub
sed -i 's/GRUB_TIMEOUT=5/GRUB_TIMEOUT=0/g' /etc/default/grub
grub-mkconfig -o /boot/grub/grub.cfg

pkglist=$(curl -fsSL https://raw.githubusercontent.com/Sahil-958/dots/main/package_list_control/pkglist_hooks_generated.txt ||echo "amd-ucode ark base base-devel bash-completion blueman bluez-utils breeze breeze-gtk breeze-icons brightnessctl btop calibre cliphist cmatrix cmus dmenu dolphin dolphin-plugins dunst efibootmgr ffmpegthumbs firefox firewalld fzf gammastep git glava grim grub grub-btrfs gwenview hyprland imagemagick imlib2 jq konsole linux linux-firmware man-db mesa-utils neofetch neovim nethogs network-manager-applet networkmanager noto-fonts-emoji os-prober pavucontrol pipewire-pulse polkit-kde-agent python-pyqt5 python-pywal python-qrencode qbittorrent qpdf qt5-graphicaleffects qt5-quickcontrols qt5-quickcontrols2 qt5ct qt6-wayland qt6ct reflector rofi sddm slurp snapper starship swappy sxiv terminus-font tldr tree ttf-fira-sans unzip vi vim viu vlc waybar wl-clipboard xautolock xclip xdg-desktop-portal-hyprland xf86-video-amdgpu xf86-video-ati xf86-video-nouveau xorg-server xorg-xbacklight xorg-xev xorg-xinit xorg-xkill xorg-xprop xorg-xsetroot yt-dlp zip")

pacman -S --noconfirm "$pkglist"
echo "%wheel ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
echo "Enter Username: "
read username
useradd -m -G wheel -s /bin/bash $username
passwd $username
echo "Pre-Installation Finish Reboot now"
ai3_path=/home/$username/arch_install3.sh
sed '1,/^#part3$/d' arch_install2.sh > $ai3_path
chown $username:$username $ai3_path
chmod +x $ai3_path
su -c $ai3_path -s /bin/sh $username
exit 

#part3
printf '\033c'
cd $HOME
sudo echo " %wheel ALL=(ALL:ALL) ALL" | tee -a  /etc/sudoers
git clone  https://github.com/Sahil-958/dots.git 

# pikaur: AUR helper
git clone https://aur.archlinux.org/pikaur.git
cd pikaur
makepkg -fsri
cd

forgien_pkgs=$(curl -fsSL https://raw.githubusercontent.com/Sahil-958/dots/main/package_list_control/pkglist_forgien_hooks_generated.txt ||echo "librewolf-bin oomox-qt5-styleplugin-git pikaur swaylock-effects-git swww themix-full-git vscodium-bin wlogout")

pikaur -S "$forgien_pkgs"

echo "making symlinks"
cd dots
sudo ln -s ~/dots/package_list_control/packgae_update.sh /usr/bin
sudo mkdir -p /etc/pacman.d/hooks
sudo ln -s ~/dots/package_list_control/update_package_list.hook /etc/pacman.d/hooks/
sudo ln -s ~/dots/package_list_control/pkglist_hooks_generated.txt /etc/pacman.d/hooks/
sudo ln -s ~/dots/package_list_control/pkglist_forgien_hooks_generated.txt /etc/pacman.d/hooks/
sudo ln -s ~/dots/hypr ~/.config/
sudo ln -s ~/dots/waybar ~/.config/
sudo ln -s ~/dots/rofi ~/.config/
sudo ln -s ~/dots/wlogout ~/.config/
sudo ln -s ~/dots/gammastep ~/.config/
sudo ln -s ~/dots/gtk-3.0 ~/.config/
sudo ln -s ~/dots/gtk-4.0 ~/.config/
sudo ln -s ~/dots/gtkrc-2.0 ~/.config/
sudo ln -s ~/dots/gtkrc-2.0 ~/
sudo ln -s ~/dots/gtkrc ~/.config/
sudo ln -s ~/dots/swappy ~/.config/
sudo ln -s ~/dots/glava ~/.config/
sudo ln -s ~/.cache/wal/bars.glsl ~/dots/glava/
sudo ln -s ~/.cache/wal/circle.glsl ~/dots/glava/
sudo ln -s ~/.cache/wal/graph.glsl ~/dots/glava/
sudo ln -s ~/.cache/wal/wave.glsl ~/dots/glava/
sudo ln -s ~/dots/dunst ~/.config
sudo ln -s ~/dots/mimeapps.list ~/.config
sudo ln -s ~/dots/swappy ~/.config
sudo ln -s ~/dots/swaylock ~/.config
sudo ln -s ~/dots/wal ~/.config
sudo mkdir -p /etc/udev/rules.d
sudo ln -s ~/dots/powerNotify/99-bat.rules /etc/udev/rules.d/
sudo ln -s ~/.cache/wal/pywal.colorscheme ~/dots/konsole
sudo ln -s ~/dots/konsole ~/.local/share/
sudo ln -s ~/dots/konsolerc ~/.config/
sudo cp -r ~/dots/fonts /usr/share/fonts
sudo cp -r ~/dots/sddm_theme_sugar_candy/ /usr/share/sddm/themes/sugar_candy
sudo cp ~/dots/sddm.conf /etc/
sudo ln -s ~/dots/.inputrc ~/
sudo ln -s ~/dots/.bashrc ~/
sudo ln -s ~/dots/.gitconfig ~/
sudo ln -s ~/dots/.vimrc ~/
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
