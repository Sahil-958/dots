## Installation

1. **Preparing & Booting into Installation Media** 

- First flash a usb stick with arch iso using following command:

    ```bash
    cat arch_iso_file.iso > /dev/sdX 
    ```
    where /dev/sdX is your usb stick. I you want to see progress use commands like pv.

2. **Booting into Installation Media**

- Boot into arch ISO
- Use follwing commands to connect to internet via WIFI

    ```zsh
    iwctl
    ```

    ```zsh
    station wlanX scan
    ```

    ```zsh
    station wlanX connnect SSID_of_your_WIFI
    ```

3. **Downloading & Running the Installation Script**

- After that enter into bash shell by running.

    ```zsh
    bash
    ```
    Copy the install script to a file using following command:

    ```bash
    curl -fsSL https://raw.githubusercontent.com/Sahil-958/dots/main/insall.sh > install.sh
    ```

    Provide the executable Permission to the file:
    ```bash
    chmod +x install.sh
    ```

    Before running it with ``./install.sh`` check the content of file by ``cat install.sh`` just to make sure that curl didn't return any error in case of wrong URL.

    If you are daring today and want to do it in one go.  
    You can use the following command to download and run the script in one go:
    ```bash
    curl -fsSL https://raw.githubusercontent.com/Sahil-958/dots/main/insall.sh > install.sh && chmod +x install.sh && ./install.sh
    ```

    In future the URL might change so  here is general URL for you to fill: 
   
     ```bash
    curl -fsSL https://raw.githubusercontent.com/user_name/repo_name/branch_name/filename.txt > install.sh
    ```

- After that run the script with ``./install.sh``

4. **Partitioning & Formatting the Installtion Disk**
- Enter the installtion disk e.g. ``/dev/sda``

- Make the paritions using cfdisk, write the newly created parition table, press q to quit cfdisk

- After that enter the root partition e.g. ``/dev/sda3``

- After that enter the home partition e.g. ``/dev/sda4``

- After that enter the swap parition e.g. ``/dev/sda2``

- After that enter y/n to create or skip creation of EFI parition. 

- If y is entered for EFI parition then enter the EFI parition e.g. ``/dev/sda1``

5. **System Configuration**

- After that enter name for your host e.g. ``your_nice_host_name``

- Enter your root password

- Enter username e.g. ``demo_user``

- Enter password for newly created user

6. **Rebooting For Post-installtion**

- After that the script will prompt you to reboot (you can still do most of step without reboot but it's better to reboot)

- Press CTRL-C to interrrup the script and then enter ``exit`` to exit from chroot enviornment and go back to iso 
- After that unmout all the mounted paritions by running

    ```bash
    umount -R /dev/sdX 
    ```
- Enter ``reboot`` to now reboot

- Press F1-F9 (whatever keys that is used to open UEFI boot menu) 

- Select the list item named the same as your hostname set during the installation

7. **Running the Post-installtion Script**

- After booting into the system,run the script again with ``./arch_install3.sh``

- This will start the NetworkManager and open NMTUI to let you connect to the Internet. After connecting via NMTUI, press the ESC button to exit out of it and continue with the script.

- After which the script will install the pikaur (AUR helper) and install the packages from AUR

- Then the script will setup symlinks from the dots folder to .config and all other places

- Now again reboot the system and Enjoy Hyprland.

