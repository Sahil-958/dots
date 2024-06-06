import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
//const hyprland = await Service.import("hyprland");
//const battery = await Service.import("battery");
//const systemtray = await Service.import("systemtray");
//const network = await Service.import("network");
//const notifications = await Service.import("notifications");

import Volume from "../volume/volume.js";
import MicroPhone from "../volume/microphone.js";
import Brightness from "../brightness/brightness.js";
import Media from "../media/media.js";
import { NotificationMainBox, NotificationPopups, Dnd } from "../notifications/notifications.js";

//import stats from "./stats/stats.js";

const ControlCenterHeaderBox = Widget.Box({
    class_name: "ControlCenterHeaderBox",
    vertical: false,
    homogeneous: true,
    children: [
        Widget.Button({
            class_name: "ControlCenterHeaderButtons",
            label: "",
        }),
        Widget.Button({
            class_name: "ControlCenterHeaderButtons",
            label: "",
        }),
        Widget.Button({
            class_name: "ControlCenterHeaderButtons",
            label: ""

        }),
        Widget.Button({
            class_name: "ControlCenterHeaderButtons",
            label: "",
        }),
        Widget.Button({
            class_name: "ControlCenterHeaderButtons",
            label: "󱎴",
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
            Media(),
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
    widthRequest: 450,
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
        keymode: "on-demand",
        setup: self => {
            self.hook(App, (_, windowName, visible) => {
                if (windowName !== "ControlCenterWindow")
                    return;
                if (visible) {
                    ControlCenterRevealer.reveal_child = true;
                }
                else {
                    ControlCenterRevealer.reveal_child = false;
                }
            });
            self.keybind("Escape", () => {
                ControlCenterRevealer.reveal_child = false;
                App.closeWindow("ControlCenterWindow");
            });
        },
        child: Widget.Box({
            class_name: "ControlCenterWindowBox",
            vertical: true,
            child: ControlCenterRevealer,
        }),
    });

    window.visible = false;

    return window;
}

export { ControlCenter };

