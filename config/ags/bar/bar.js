import brightness from "../services/brightness.js";
import { ControlCenter } from "../control_center/control_center.js";
const hyprland = await Service.import("hyprland");
const apps = await Service.import("applications");
const mpris = await Service.import("mpris");
const audio = await Service.import("audio");
const battery = await Service.import("battery");
const systemtray = await Service.import("systemtray");
const network = await Service.import("network");

const date = Variable("", {
    poll: [1000, "date '+%I:%M:%S%p'"],
});

const speed = Variable("", {
    poll: [1000, "netspeed -b"]
});


const ntSpeed = Widget.Label({
    class_name: "BarNetworkSpeedLabel",
    label: speed.bind(),
});

const focusedTitle = Widget.Label({
    class_name: "BarWindowTitleLabel",
    label: hyprland.active.client.bind("title"),
    visible: hyprland.active.client.bind("title").as(title => !!title),
    justification: "left",
    truncate: "middle",
    xalign: 0,
    maxWidthChars: 30,
    useMarkup: true,
});

const dispatch = (/** @type {string | number} */ ws) => hyprland.messageAsync(`dispatch workspace ${ws}`);

const Workspaces = () => Widget.EventBox({
    onScrollUp: () => {
        if (!(hyprland.active.workspace.id >= 10)) {
            dispatch("+1");
        }
    },
    onScrollDown: () => {
        if (!(hyprland.active.workspace.id <= 1)) {
            dispatch("-1");
        }
    },
    child: Widget.Box({
        class_name: "BarWorkspaces",
        children: Array.from({ length: 10 }, (_, i) => i + 1).map(i => Widget.Button({
            attribute: i,
            label: `${i}`,
            onClicked: () => dispatch(i),
        })),

        setup: self => self.hook(hyprland, () => self.children.forEach(btn => {
            btn.toggleClassName("BarActiveWorkspace",
                hyprland.monitors.some(active_ws => active_ws.activeWorkspace.id === btn.attribute));
            btn.toggleClassName("BarHasWindow",
                hyprland.workspaces.some(ws => ws.windows > 0 && ws.id === btn.attribute));
            btn.visible = (btn.attribute < 6
                || hyprland.workspaces.some(ws => ws.id > 0
                    && ws.id === btn.attribute));
        })),
    }),
});


const appTray = Widget.Box({
    class_name: "BarAppTrayBox",
    children: hyprland.bind("clients").as(clients => clients.map(client => {
        const matchingObject = apps.list.find(app => app["wm-class"] === client.class);
        let client_icon = matchingObject?.icon_name || "package-x-generic";
        return Widget.Button({
            class_name: "BarAppTrayButton",
            visible: hyprland.bind("clients").as(clients => clients.length > 0),
            child: Widget.Icon({
                class_name: "BarAppTrayIcon",
                icon: client_icon,
            }),
            tooltip_markup: client.title,
            on_clicked: self => {
                hyprland.messageAsync(`dispatch focuswindow address:${client.address}`);
            },
            setup: self => {
                self.hook(hyprland.active.client, self => {
                    self.toggleClassName("Active", hyprland.active.client.address == client.address);
                });
            },
        });
    }),
    ),
});

function Clock() {
    return Widget.EventBox({
        onPrimaryClick: () => { date.setValue('[1000, \'date "+%A %dth %B, %Y"\']'); },
        child:
            Widget.Label({
                class_name: "BarClockLabel",
                label: date.bind(),
            })
    });
}

function Media() {
    return Widget.Button({
        class_name: "BarMediaButton",
        on_primary_click: () => mpris.getPlayer("")?.playPause(),
        on_scroll_up: () => mpris.getPlayer("")?.next(),
        on_scroll_down: () => mpris.getPlayer("")?.previous(),
        child: Widget.Label({
            class_name: "BarMediaTitle",
            justification: "left",
            truncate: "end",
            xalign: 0,
            maxWidthChars: 30,
            useMarkup: true,
        })
    }).hook(mpris, self => {
        if (mpris.players.length > 0) {
            const currently_playing = mpris.players.find(player => player.play_back_status == "Playing")
            if (currently_playing) {
                self.show();
                self.child.label = `Playing ${currently_playing?.track_title} By ${currently_playing?.track_artists}`;
                self.toggleClassName("BarMediaButtonEmpty", false);
                return;
            }
        }
        self.label = "";
        self.hide();
    }, "changed");
}


function Volume() {
    const icons = {
        101: "overamplified",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
    };

    function getIcon() {
        const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(
            threshold => threshold <= audio.speaker.volume * 100);
        return `audio-volume-${icons[icon]}-symbolic`;
    }

    const icon = Widget.Icon({
        class_name: "BarVolumeIcon",
        icon: Utils.watch(getIcon(), audio.speaker, getIcon),
    });

    const label = Widget.Label({
        class_name: "BarVolumeLabel",
    }).hook(audio.speaker, self => {
        self.tooltip_text = audio.speaker.description;
        self.has_tooltip = true;
        self.label = `${Math.floor(audio.speaker.volume * 100)}%`;
    });

    return Widget.EventBox({
        class_name: "BarVolumeEventBox",
        onScrollDown: () => { audio.speaker.volume -= 0.01; },
        onScrollUp: () => { audio.speaker.volume += 0.01; },
        child: Widget.Box({
            class_name: "BarVolumeBox",
            css: "min-width: 40px",
            spacing: 5,
            children: [icon, label],
        }),
    });
}


function BrightnessLabel() {
    return Widget.EventBox({
        onScrollDown: () => { brightness.screen_value -= 0.01; },
        onScrollUp: () => { brightness.screen_value += 0.012; },
        child: Widget.Box({
            class_name: "BarBrightnessBox",
            hasTooltip: true,
            spacing: 5,
            children: [
                Widget.Icon({
                    class_name: "BrightnessIcon",
                    size: 20,
                }),
                Widget.Label({
                    class_name: "BarBrightnessLabel"
                })
            ],

        }).hook(brightness, self => {
            let percentage = Math.floor(brightness.screen_value * 100);
            const icons = {
                80: "high",
                34: "medium",
                0: "low",
            };
            const icon = icons[[80, 34, 0].find(threshold => threshold <= percentage)];

            self.children[0].icon = "display-brightness-" + icon + "-symbolic";
            self.children[1].label = `${percentage}`;
        }),
    });
}

function BatteryLabel() {
    return Widget.Box({
        class_name: "BarBatteryNormal",
        hasTooltip: true,
        spacing: 5,
        children: [
            Widget.Icon({
                class_name: "BatteryIcon"
            }),
            Widget.Label({
                class_name: "BatteryLabel"
            })
        ],

    }).hook(battery, self => {
        self.children[0].icon = `battery-level-${Math.floor(battery.percent / 10) * 10}-symbolic`
        self.children[1].label = `${battery.percent}%`;
        self.visible = battery.available;
        self.toggleClassName("BarBatteryCritical", (battery.percent < 20 ? true : false));
        self.toggleClassName((battery.percent < 20
            ? "BatteryCritical"
            : (battery.percent >= 90 ? "BatteryFull" : "")
        ), true);
        self.tooltip_text = `Percentage: ${battery.percent}
Energy: ${battery.energy}w
${battery.charging ? "Charging" : "Discharging"} Rate: ${battery.energy_rate}w
Time Remaining: ${Math.floor(battery.time_remaining / 3600)}hrs ${Math.floor((battery.time_remaining % 3600) / 60)}min `;
    }, "changed");
}


const WifiIndicator = () => Widget.Box({
    class_name: "BarWifiBox",
    spacing: 5,
    children: [
        Widget.Icon({
            class_name: "BarWifiIcon",
            icon: network.wifi.bind("icon_name"),
        }),
        Widget.Label({
            class_name: "BarWifiLabel",
            label: network.wifi.bind("ssid")
                .as(ssid => ssid || "Unknown"),
        }),
    ],
});

const WiredIndicator = () => Widget.Icon({
    class_name: "BarWiredIcon",
    icon: network.wired.bind("icon_name"),
});

const NetworkIndicator = () => Widget.Stack({
    class_name: "BarNetworkStack",
    children: {
        wifi: WifiIndicator(),
        wired: WiredIndicator(),
    },
    shown: network.bind("primary").as(p => p || "wifi"),
});



function SysTray() {
    const items = systemtray.bind("items")
        .as(items => items.map(item => Widget.Button({
            className: "BarSysTrayButton",
            child: Widget.Icon({
                class_name: "BarSystrayIcon",
                icon: item.bind("icon")
            }),
            on_primary_click: (_, event) => item.activate(event),
            on_secondary_click: (_, event) => item.openMenu(event),
            tooltip_markup: item.bind("tooltip_markup"),
        })));

    return Widget.Box({
        className: "BarSysTrayBox",
        children: items,
        visible: systemtray.bind("items").as(items => items.length > 0),
    });
}

function contorlCenterRevealer() {
    return Widget.EventBox({
        onPrimaryClick: () => {
            App.toggleWindow("ControlCenterWindow");
        },
        child: Widget.Box({
            className: "BarControlCenterBox",
            children: [
                Widget.Icon({
                    className: "BarControlCenterIcon",
                    icon: "preferences-system-symbolic",
                }),
            ]
        }),
    });
}


// layout of the bar
function Left() {
    return Widget.Box({
        className: "BarBarLeftBox",
        spacing: 8,
        children: [
            Media(),
            focusedTitle,
            appTray,
        ],
    });
}

function Center() {
    return Widget.Box({
        className: "BarBarCenterBox",
        spacing: 8,
        children: [
            Workspaces(),
        ],
    });
}

function Right() {
    return Widget.Box({
        className: "BarBarRightBox",
        hpack: "end",
        spacing: 8,
        children: [
            ntSpeed,
            SysTray(),
            NetworkIndicator(),
            BrightnessLabel(),
            Volume(),
            BatteryLabel(),
            Clock(),
            contorlCenterRevealer(),
        ],
    });
}

function Bar(monitor = 0) {
    return Widget.Window({
        name: `bar-${monitor}`, // name has to be unique
        class_name: "BarWindow",
        monitor,
        margins: [0, 4, 0, 4],
        height_request: 30,
        anchor: ["top", "left", "right"],
        exclusivity: "exclusive",
        child: Widget.CenterBox({
            class_name: "BarMainCenterBox",
            start_widget: Left(),
            center_widget: Center(),
            end_widget: Right(),
        }),
    });
}


export { Bar };

