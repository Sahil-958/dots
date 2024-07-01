import Lock from "gi://GtkSessionLock";
import Gdk from "gi://Gdk?version=3.0";
import Gtk from "gi://Gtk?version=3.0";

import Media from "../media/media.js";
import { RoundedAngleEnd, RoundedCorner } from "../roundedCorner/roundedCorner.js";

App.applyCss(`${App.configDir}/lockscreen.css`);
App.applyCss(`${App.configDir}/../media/media.css`);

const lock = Lock.prepare_lock();
const windows = [];
function unlock() {
    overlayChild.reveal_child = false;
    Utils.timeout(1800, () => {
        winRevealer.reveal_child = false;
    });
    //winRevealer.reveal_child = false;
    Utils.timeout(2500, () => {
        lock.unlock_and_destroy();
        windows.forEach(w => w.window.destroy());
        Gdk.Display.get_default()?.sync();
        App.quit();
    });
}

Utils.timeout(15000, () => {
    unlock();
});


const LoginBox = () => {
    const loginStatusRevealer = Widget.Revealer({
        class_name: "LoginStatusRevealer",
        reveal_child: false,
        transition: "slide_down",
        transition_duration: 400,
        child: Widget.Label({
            class_name: "LoginStatusLabel",
            label: "Invalid Authentication Key",
        }),
    });

    return Widget.Box({
        class_name: "LoginBox",
        vertical: true,
        spacing: 22,
        children: [
            Widget.Box({
                hexpand: true,
                class_name: "LoginAvatarBox",
                height_request: 140,
                css: `
                background-image: url("${Utils.HOME}/octane_pfp.jpg");
                `,
            }),
            Widget.Box({
                class_name: "LoginEntryBox",
                hexpand: true,
                vertical: true,
                children: [
                    Widget.Entry({
                        class_name: "LoginEntry",
                        placeholderText: "Authentication Key",
                        primaryIconName: "system-lock-screen-symbolic",
                        xalign: 0.5,
                        hexpand: true,
                        visibility: false,
                        on_change: self => {
                            if (!self.text) return;
                            loginStatusRevealer.reveal_child = false;
                        },
                        on_accept: self => {
                            self.parent.toggleClassName("Failed", false);
                            self.sensitive = false;
                            loginStatusRevealer.reveal_child = true;
                            loginStatusRevealer.child.label = "Verifying Credentials...";
                            Utils.timeout(500, () => {
                                loginStatusRevealer.reveal_child = false;
                            });
                            Utils.authenticate(self.text ?? "")
                                .then(() => {
                                    Utils.timeout(500, () => {
                                        return unlock();
                                    });
                                }).catch(e => {
                                    self.parent.toggleClassName("Failed", true);
                                    loginStatusRevealer.reveal_child = true;
                                    loginStatusRevealer.child.label = e.message;
                                    self.text = "";
                                    self.placeholder_text = e.message;
                                    self.sensitive = true;
                                    self.grab_focus();
                                });
                        }
                    }).on("realize", (entry) => entry.grab_focus()),
                    loginStatusRevealer,
                ]
            }),
        ]
    });
};

const overlayChild = Widget.Revealer({
    reveal_child: false,
    transition: "slide_right",
    halign: Gtk.Align.START,
    transition_duration: 800,
    child: Widget.Box({
        class_name: "OverlayRevealerBox",
        width_request: Math.floor(Gdk.Screen.width() / 3),
        children: [
            Widget.Box({
                class_name: "OverlayRevealerBoxChildren",
                vertical: true,
                spacing: 16,
                children: [
                    LoginBox(),
                    Widget.Box({ vexpand: true }),
                    Widget.Box({
                        //Signature of Media(valign= Gtk.Align.FILL, halign= Gtk.Align.FILL),
                        child: Media(Gtk.Align.END),
                        hexpand: true,
                        vexpand: false,
                    }),
                    Widget.Box({
                        //sleep and hibernate buttons
                        halign: Gtk.Align.CENTER,
                        spacing: 16,
                        children: [
                            Widget.Button({
                                css: "all:unset;",
                                child: Widget.Icon({ icon: "system-suspend-symbolic", size: 48 }),
                                onClicked: () => Utils.execAsync(["systemctl", "suspend"]),
                            }),
                            Widget.Button({
                                css: "all:unset;",
                                child: Widget.Icon({ icon: "system-hibernate-symbolic", size: 48 }),
                                onClicked: () => Utils.execAsync(["systemctl", "hibernate"]),
                            }),

                        ]
                    }),
                ],
            }),
        ],
    }),
}).on("realize", self => Utils.idle(() => self.reveal_child = true));


const revealerChild = Widget.Box({
    class_name: "LockWindowBackgroundGradientBox",
    child: Widget.Box({
        class_name: "LockWindowBackgroundBox",
        child: Widget.Overlay({
            child: overlayChild,
            overlays: [
                RoundedCorner("topleft", { class_name: "corner" }),
                RoundedCorner("topright", { class_name: "corner" }),
            ],
        }),
    }),
});


const winRevealer = Widget.Revealer({
    class_name: "LockWindowRevealer",
    reveal_child: false,
    transition: "crossfade",
    transition_duration: 1000,
    child: revealerChild,
}).on("realize", self => Utils.idle(() => self.reveal_child = true));

const LockWindow = () => {
    const window = new Gtk.Window({});
    window.child = Widget.Box({
        children: [
            winRevealer,
        ]
    });

    Utils.execAsync(["bash", "-c", "cat ~/.cache/current_wall_path.txt"])
        .then(res => {
            if (!res) return;
            revealerChild.child.css = `
            background-image: url("${res}");
                       `;
        }).catch(e => console.error(e));

    return window;
};


function createWindow(monitor) {
    const window = LockWindow();
    const win = { window, monitor };
    windows.push(win);
    return win;
}
function lock_screen() {
    const display = Gdk.Display.get_default();
    for (let m = 0; m < display?.get_n_monitors(); m++) {
        const monitor = display?.get_monitor(m);
        createWindow(monitor);
    }
    display?.connect("monitor-added", (disp, monitor) => {
        const w = createWindow(monitor);
        lock.new_surface(w.window, w.monitor);
        w.window.show();
    });
    lock.lock_lock();
    windows.map(w => {
        lock.new_surface(w.window, w.monitor);
        w.window.show();
    });
}

function on_finished() {
    lock.destroy();
    windows.forEach(w => w.window.destroy());
    Gdk.Display.get_default()?.sync();
    App.quit();
}
// lock.connect("locked", on_locked);
lock.connect("finished", on_finished);
lock_screen();
