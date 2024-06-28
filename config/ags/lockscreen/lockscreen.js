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

Utils.timeout(9000, () => {
    unlock();
});


const LoginBox = () => Widget.Box({
    class_name: "LoginBox",
    vertical: true,
    spacing: 22,
    children: [
        Widget.Box({
            hexpand: true,
            class_name: "LoginAvatarBox",
            height_request: 140,
            css: `
            border-radius: 5px;
            background-image: url("${Utils.HOME}/octane_pfp.jpg");
            background-size: cover;
            background-position: center;
            `,
        }),
        Widget.Box({
            class_name: "LoginEntryBox",
            hexpand: true,
            children: [
                Widget.Entry({
                    class_name: "LoginEntry",
                    placeholderText: "Authentication Key",
                    primaryIconName: "system-lock-screen-symbolic",
                    xalign: 0.5,
                    hexpand: true,
                    visibility: false,
                    on_accept: self => {
                        self.sensitive = false;
                        Utils.authenticate(self.text ?? "")
                            .then(() => unlock())
                            .catch(e => {
                                self.text = "";
                                self.placeholder_text = e.message;
                                self.sensitive = true;
                            });
                    }
                }).on("realize", (entry) => entry.grab_focus()),
            ]
        }),
    ]
});

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
            console.log(res);
            revealerChild.child.css = `
            background-image: url("${res}");
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
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
