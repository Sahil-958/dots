pacman -Qem > /etc/pacman.d/hooks/pkglist_forgien_hooks_generated.txt
pacman -Qe > /etc/pacman.d/hooks/pkglist_hooks_generated.txt

git -C /home/sawhill/dots add package_list_control/pkglist_forgien_hooks_generated.txt package_list_control/pkglist_hooks_generated.txt && git -C /home/sawhill/dots commit -m "PACMAN HOOKS: Updated package list to relect new changes" && git -C /home/sawhill/dots push


