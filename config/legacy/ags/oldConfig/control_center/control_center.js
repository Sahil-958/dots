import Gtk from "gi://Gtk";
//const hyprland = await Service.import("hyprland");
//const battery = await Service.import("battery");
//const systemtray = await Service.import("systemtray");
//const network = await Service.import("network");
//const notifications = await Service.import("notifications");

const bluetooth = await Service.import("bluetooth");
import Volume from "../volume/volume.js";
import MicroPhone from "../volume/microphone.js";
import Brightness from "../brightness/brightness.js";
import Media from "../media/media.js";
import { NotificationMainBox, NotificationPopups, Dnd } from "../notifications/notifications.js";

//import stats from "./stats/stats.js";

const media = Media();

const ControlCenterHeaderBox = Widget.Box({
    class_name: "ControlCenterHeaderBox",
    vertical: false,
    homogeneous: true,
    children: [
        Widget.Button({
            class_name: "ControlCenterHeaderButtons",
            label: "",
        }),
        Widget.ToggleButton({
            class_name: "ControlCenterHeaderButtons",
            onToggled: () => {
                bluetooth.toggle();
            },
            child: Widget.Icon({
                icon: "bluetooth-active-symbolic",
            }),
            setup: self => {
                self.active = bluetooth.enabled;
            }
        }),
        Widget.ToggleButton({
            class_name: "ControlCenterHeaderButtons",
            label: "",
            onToggled: ({ active }) => {
                Utils.execAsync(["bash",
                    "-c",
                    `nmcli radio wifi ${active ? "off" : "on"}`,
                ]).catch((err) => {
                    if (err)
                        console.log(err);
                });
            },
        }),

        Widget.ToggleButton({
            class_name: "ControlCenterHeaderButtons",
            label: "",
            setup: self => {
                Utils.execAsync(["bash", "-c", "pgrep hypridle"]).then((result) => {
                    self.active = !!result;
                    self.toggleClassName("Active", !!result);
                }).catch((err) => {
                    if (err)
                        console.log(err);
                });
            },
            onToggled: self => {
                const command = self.active ? "pgrep hypridle || hypridle &>/dev/null &" : "killall hypridle";
                Utils.execAsync([
                    "bash", "-c",
                    command,
                ]).catch((err) => {
                    if (err)
                        console.log(err);
                });
                self.toggleClassName("Active", self.active);
            },
        }),

        Widget.ToggleButton({
            class_name: "ControlCenterHeaderButtons",
            label: "󱎴",
            setup: self => {
                Utils.execAsync(["bash", "-c", "hyprshade current"]).then((result) => {
                    self.active = !!result;
                    self.toggleClassName("Active", !!result);
                }).catch((err) => {
                    if (err)
                        console.log(err);
                });
            },
            onToggled: self => {
                const command = self.active ? "hyprshade auto" : "hyprshade off";
                Utils.execAsync(["bash", "-c", command]).catch((err) => {
                    if (err)
                        console.log(err);
                });
                self.toggleClassName("Active", self.active);
            },
        }),
    ],
});

function ScrollableMainBox() {
    return Widget.Box({
        class_name: "ControlCenterMainBox",
        vertical: true,
        spacing: 10,
        children: [
            ControlCenterHeaderBox,
            Brightness(),
            Volume(),
            MicroPhone(),
            media,
            NotificationMainBox(),
            Dnd(),
        ],
    });
}

const ControlCenterScrollable = () => Widget.Scrollable({
    class_name: "ControlCenterScrollable",
    vscroll: "automatic",
    hscroll: "never",
    minContentHeight: 900,
    child: ScrollableMainBox(),
});

const ControlCenterRevealer = Widget.Revealer({
    class_name: "ControlCenterRevealer",
    transition: "slide_down",
    transitionDuration: 500,
    child: ControlCenterScrollable(),
    reveal_child: false,
});

function ControlCenter(monitor = 0) {
    const window = Widget.Window({
        monitor,
        name: "ControlCenterWindow", // name has to be unique
        class_name: "ControlCenterWindow",
        margins: [0, 4, 0, 0],
        anchor: ["top", "bottom", "right"],
        exclusivity: "normal",
        valign: Gtk.Align.START,
        halign: Gtk.Align.CENTER,
        widthRequest: 450,
        keymode: "on-demand",
        setup: self => {
            self.hook(App, (_, windowName, visible) => {
                if (windowName !== "ControlCenterWindow")
                    return;
                ControlCenterRevealer.reveal_child = visible ? true : false;
            });
            self.keybind("Escape", () => {
                ControlCenterRevealer.reveal_child = false;
                App.closeWindow("ControlCenterWindow");
            });
            self.keybind("n", () => {
                media.grab_focus();
            });
        },
        child: Widget.Box({
            class_name: "ControlCenterWindowBox",
            child: ControlCenterRevealer,
        }),
    });

    window.visible = false;

    return window;
}

export { ControlCenter };

