import Gdk from "gi://Gdk";
//import Gtk from "gi://Gtk";
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

const ControlCenterScrollable = () => Widget.Scrollable({
    class_name: "ControlCenterScrollable",
    vscroll: "automatic",
    hscroll: "never",
    vexpand: true,
    child: Widget.Box({
        class_name: "ControlCenterMainBox",
        vertical: true,
        vexpand: true,
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
    }),
});

function ControlCenter(monitor = 0) {
    return Widget.Window({
        monitor,
        name: "ControlCenterWindow", // name has to be unique
        widthRequest: 450,
        class_name: "ControlCenterWindow",
        margins: [10, 10, 10, 0],
        anchor: ["top", "bottom", "right"],
        exclusivity: "normal",
        child: ControlCenterScrollable(),
    });
}


export { ControlCenter };

