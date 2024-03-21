pacman -Qqem > /etc/pacman.d/hooks/pkglist_forgien_hooks_generated.txt
pacman -Qqen > /etc/pacman.d/hooks/pkglist_hooks_generated.txt

# Check if there are changes in the git repository for the specified files
if sudo -u sawhill git -C /home/sawhill/dots/etc diff --quiet package_list_control/pkglist_forgien_hooks_generated.txt package_list_control/pkglist_hooks_generated.txt; then
    echo "No changes to commit."
else
    # Add, commit, and push changes
    sudo -u sawhill git -C /home/sawhill/dots/etc add package_list_control/pkglist_forgien_hooks_generated.txt package_list_control/pkglist_hooks_generated.txt
    sudo -u sawhill git -C /home/sawhill/dots commit -m "PACMAN HOOKS: Updated package list"
    sudo -u sawhill git -C /home/sawhill/dots push
fi

