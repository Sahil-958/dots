//import Gdk from "gi://Gdk";
//import Gtk from "gi://Gtk";
//const hyprland = await Service.import("hyprland");
//const battery = await Service.import("battery");
//const systemtray = await Service.import("systemtray");
//const network = await Service.import("network");
//const notifications = await Service.import("notifications");

import { NotificationPopups } from "./notifications/notifications.js";
//import stats from "./stats/stats.js";
import { applauncher } from "./applauncher/applauncher.js";
import { WallSelectorWindow } from "./wallselector/wallselector.js";
//import { wallpicker } from "./wallpicker/wallpikcer.js";
import { ControlCenter } from "./control_center/control_center.js";
import { Bar } from "./bar/bar.js";

Utils.monitorFile(
    // directory that contains the scss files
    `${App.configDir}`,
    // reload function
    function() {
        // main scss file
        //const css = `${App.configDir}/control_center/style.css`;
        const css = `${App.configDir}/style.css`;

        App.resetCss();
        App.applyCss(css);
    },
);

Utils.monitorFile(
    `${Utils.HOME}/.cache/wal/colors-waybar.css`,
    function() {
        const css = `${App.configDir}/style.css`;
        App.resetCss();
        App.applyCss(css);
    },
);

App.config({
    style: "./style.css",
    closeWindowDelay: {
        "ControlCenterWindow": 500,
        "AppLauncherWindow": 300,
        "WallSelectorWindow": 300,
        "NotificationPopupsBox": 500,
    },

    windows: [
        Bar(0),
        ControlCenter(0),
        NotificationPopups(),
        applauncher(),
        WallSelectorWindow(),
        //wallpicker(),
        //stats(0),
        // you can call it, for each monitor
        // Bar(0),
        // Bar(1)
    ],
});

