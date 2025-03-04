import Gtk from "gi://Gtk";

const { query } = await Service.import("applications");
const WINDOW_NAME = "AppLauncherWindow";

/** @param {import('resource:///com/github/Aylur/ags/service/applications.js').Application} app */
const AppItem = app => Widget.Button({
    className: "AppItemButton",
    attribute: {
        "id": "AppItemButton",
        "app": app,
    },
    on_clicked: () => {
        App.closeWindow(WINDOW_NAME);
        app.launch();
    },
    child: Widget.Box({
        className: "AppItemBox",
        spacing: 10,
        children: [
            Widget.Icon({
                className: "AppItemIcon",
                size: 42,
                setup: self => {
                    self.hook(app, () => {
                        if (Utils.lookUpIcon(app.icon_name || "")) {
                            self.icon = app.icon_name || "";
                        }
                    });
                },
            }),
            Widget.Label({
                className: "AppItemLabel",
                label: app.name,
                xalign: 0,
                vpack: "center",
                truncate: "end",
            }),
        ],
    }),
});

const CalcResult = result => Widget.Button({
    attribute: {
        "result": result,
        "id": "CalcResultButton",
    },
    className: "CalcResultButton",
    on_clicked: () => {
        //copy to clipboard
        Utils.execAsync(["bash", "-c", `echo "${result}"|wl-copy`]);
        Utils.notify("AGS", `Result copied to clipboard: ${result}`);
        App.toggleWindow(WINDOW_NAME);
    },
    child: Widget.Box({
        className: "CalcResultBox",
        spacing: 10,
        children: [
            Widget.Icon({
                className: "CalcResultIcon",
                icon: "accessories-calculator",
                size: 42,
            }),
            Widget.Label({
                className: "CalcResultLabel",
                label: result,
                xalign: 0,
                lines: 3,
                //vpack: "center",
                truncate: "end",
            }),
        ],
    }),
});

const FileResult = result => Widget.Button({
    attribute: {
        "result": result,
        "id": "FileResultButton",
    },
    className: "FileResultButton",
    on_clicked: () => {
        Utils.notify("AGS", `Opening file: ${result}`);
        Utils.execAsync(["bash", "-c", `xdg-open "${Utils.HOME}/${result}" & disown`]).catch((err) => {
            if (!err) return;
            Utils.execAsync(["bash", "-c", `xdg-open "${result}" & disown`]).catch((err) => {
                if (!err) return;
                Utils.notify("AGS", `Error: ${err}`);
            });
        });
        App.toggleWindow(WINDOW_NAME);
    },
    child: Widget.Box({
        className: "FileResultBox",
        spacing: 10,
        children: [
            Widget.Icon({
                className: "FileResultIcon",
                size: 42,
            }).on("realize", self => {
                if (result.endsWith("/")) {
                    self.icon = "folder";
                    return;
                }
                switch (result.split(".").pop()) {
                    case "png": case "jpg": case "jpeg": case "svg":
                        self.icon = `${Utils.HOME}/${result}`;
                        break;
                    case "gif": case "webp":
                        self.icon = "image-x-generic";
                        break;
                    case "pdf":
                        self.icon = "application-x-pdf";
                        break;
                    case "zip": case "tar": case "gz": case "xz": case "7z": case "rar":
                        self.icon = "application-x-zip";
                        break;
                    case "mp4": case "mkv": case "avi": case "webm":
                        self.icon = "video-x-generic";
                        break;
                    case "mp3": case "flac": case "wav": case "ogg": case "m4a":
                        self.icon = "audio-x-generic";
                        break;
                    case "doc": case "docx": case "odt":
                        self.icon = "x-office-document";
                        break;
                    case "xls": case "xlsx": case "ods":
                        self.icon = "x-office-spreadsheet";
                        break;
                    case "ppt": case "pptx": case "odp":
                        self.icon = "x-office-presentation";
                        break;
                    case "sh":
                        self.icon = "text-x-script";
                        break;
                    default:
                        self.icon = "text-x-generic";
                }
            }),
            Widget.Label({
                className: "FileResultLabel",
                label: result,
                lines: 2,
                wrap: true,
                xalign: 0,
                vpack: "center",
                truncate: "end",
            }),
        ],
    }),
});


const CommandResult = result => Widget.Button({
    attribute: {
        "result": result,
        "id": "CommandResultButton",
    },
    className: "CommandResultButton",
    on_clicked: () => {
        Utils.execAsync(["bash", "-c", `"${result}"`]).then((res) => {
            if (!res && res === "") return;
            Utils.notify(`${result}`, `${res}`);
            Utils.execAsync(["bash", "-c", `echo "${res}"|wl-copy`]);
        }).catch((err) => {
            if (!err) return;
            Utils.notify(`${result}`, `Error: ${err}`);
        });
        App.toggleWindow(WINDOW_NAME);
    },
    child: Widget.Box({
        className: "CommandResultBox",
        spacing: 10,
        children: [
            Widget.Icon({
                className: "CommandResultIcon",
                icon: "utilities-terminal",
                size: 42,
            }),
            Widget.Label({
                className: "CommandResultLabel",
                label: result,
                xalign: 0,
                lines: 3,
                //vpack: "center",
                truncate: "end",
            }),
        ],
    }),
});


const Applauncher = ({ width = 500, height = 500, spacing = 10 }) => {
    // list of application buttons
    let applications = query("").map(AppItem);

    // container holding the buttons
    const list = Widget.Box({
        className: "AppLauncherList",
        vertical: true,
        children: applications,
        spacing,
    });

    // repopulate the box, so the most frequent apps are on top of the list
    function repopulate() {
        applications = query("").map(AppItem);
        list.children = applications;
    }

    function onChange({ text }) {
        //Check if the text stats with a ? 
        if (text?.startsWith("?")) {
            let command = `qalc "${text}"`;
            text = text.replace("?", "");
            command = `qalc "${text}"`;

            if (text.startsWith("?")) {
                text = text.replace("?", "");
                command = `qalc -l "${text}"`;
            }
            Utils.execAsync(["bash", "-c", command]).then((result) => {
                if (result) {
                    let resWid = result.split(/\r?\n|\t/).map((item) => {
                        let isEmpty = item === "";
                        let isFor = item.includes("For more");
                        if (isEmpty || isFor) return;
                        return CalcResult(item);
                    });
                    list.children = resWid;
                }
            }).catch((err) => {
                if (!err) return;
                console.log(err);
            });
        } else if (text.startsWith(">")) {
            text = text.replace(">", "");
            if (text === "") return;

            let command;
            if (text.startsWith("/")) {
                let path = text;
                command = `fd --search-path "${path}"\\
                    --max-results 30`;
            }
            else {
                command =
                    `fd -i -p \\
                    "${text}" \\
                    --base-directory ${Utils.HOME} \\
                    --max-results 30 \\
                    --exclude "*.snapshots*"\\
                    --exclude "*.pyc"\\
                    --exclude "*__pycache__"\\
                    --exclude "*.git"\\
                    --exclude "*site-packages"\\
                    --exclude "*pikaur*"`;
            }

            if (text === "") return;
            Utils.execAsync(["bash", "-c", command]).then((result) => {
                if (result) {
                    let resWid = result.split(/\r?\n/).map((item) => {
                        return FileResult(item);
                    });
                    list.children = resWid;
                }
            }).catch((err) => {
                if (!err) return;
                print(err);
            });

        } else if (text.startsWith("!")) {
            text = text.replace("!", "");
            if (text === "") return;

            let command = `compgen -abcegjkuv ${text}`;

            if (text === "") return;
            Utils.execAsync(["bash", "-c", command]).then((result) => {
                if (result) {
                    let resWid = result.split(/\r?\n/).map((item) => {
                        return CommandResult(item);
                    });
                    list.children = resWid;
                }
            }).catch((err) => {
                if (!err) return;
                print(err);
            });

        } else {
            repopulate();
            applications.forEach(item => {
                item.visible = item.attribute.app.match(text ?? "");
            });
        }
    }

    function onAccept({ text }) {
        if (text.startsWith("!")) {
            let command = text.replace("!", "");
            Utils.execAsync(["bash", "-c", `${command}`]).then((res) => {
                if (!res && res === "") return;
                Utils.notify(`${command}`, `${res}`);
            }).catch((err) => {
                if (!err) return;
                Utils.notify(`${command}`, `Error: ${err}`);
            });
            App.toggleWindow(WINDOW_NAME);
            return;
        }
        // make sure we only consider visible (searched for) applications
        if (list.children[0].attribute.id === "CalcResultButton") {
            let result = list.children[0].attribute.result;
            Utils.execAsync(["bash", "-c", `echo "${result}"|wl-copy`]);
            Utils.notify("AGS", `Result copied to clipboard: ${result}`);
            App.toggleWindow(WINDOW_NAME);
            return;
        } else if (list.children[0].attribute.id === "FileResultButton") {
            let result = list.children[0].attribute.result;
            Utils.execAsync(["bash", "-c", `xdg-open "${result}" & disown`]).catch((err) => {
                if (!err) return;
                Utils.execAsync(["bash", "-c", `xdg-open "${Utils.HOME}/${result}" & disown`]).catch((err) => {
                    if (!err) return;
                    Utils.notify("AGS", `Error: ${err}`);
                });
            });
            Utils.notify("AGS", `Opening file: ${result}`);
            App.toggleWindow(WINDOW_NAME);
            return;
        }
        const results = applications.filter((item) => item.visible);
        if (results[0]) {
            App.toggleWindow(WINDOW_NAME);
            results[0].attribute.app.launch();
        }
    }

    // search entry
    const entry = Widget.Entry({
        className: "AppLauncherEntry",
        placeholderText: "Enter application name...",
        capsLockWarning: true,
        hexpand: true,
        css: `margin-bottom: ${spacing}px;`,
        on_accept: ({ text }) => onAccept({ text }),
        on_change: ({ text }) => onChange({ text }),
    });

    const Scrollable = Widget.Scrollable({
        className: "AppLauncherScrollable",
        hscroll: "never",
        child: list,
        minContentHeight: height,
    });

    return Widget.Box({
        vertical: true,
        className: "AppLauncherBox",
        children: [
            entry,
            // wrap the list in a scrollable
            Scrollable,
        ],
        setup: self => {
            self.hook(App, (_, windowName, visible) => {
                if (windowName !== WINDOW_NAME)
                    return;

                // when the applauncher shows up
                if (visible) {
                    repopulate();
                    entry.text = "";
                    entry.grab_focus();
                }
            });
        },
    });
};

const AppLauncherRevealer = Widget.Revealer({
    className: "AppLauncherRevealer",
    transition: "slide_down",
    transitionDuration: 300,
    child: Widget.Box({
        className: "AppLauncherRevealerBox",
        child: Applauncher({
            width: 450,
            height: 700,
            spacing: 12,
        }),
    }),
    revealChild: false,
});


export function applauncher() {
    const win = Widget.Window({
        className: "AppLauncherWindow",
        name: "AppLauncherWindow",
        anchor: ["top", "left"],
        margins: [0, 0, 0, 4],
        widthRequest: 450,
        heightRequest: 700,
        keymode: "on-demand",
        valign: Gtk.Align.START,
        halign: Gtk.Align.CENTER,
        setup: self => {
            self.hook(App, (_, windowName, visible) => {
                if (windowName !== "AppLauncherWindow")
                    return;
                AppLauncherRevealer.reveal_child = visible ? true : false;
            });
            self.keybind("Escape", () => {
                AppLauncherRevealer.reveal_child = false;
                App.closeWindow("AppLauncherWindow");
            });
        },
        child: Widget.Box({
            className: "AppLauncherWindowBox",
            vertical: true,
            child: AppLauncherRevealer,
        }),
    });
    win.visible = false;
    return win;
}
