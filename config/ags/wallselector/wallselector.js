import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";
import GdkPixbuf from "gi://GdkPixbuf";

const WINDOW_NAME = "WallSelectorWindow";

const WallResult = result => Widget.Button({
    attribute: {
        "result": result,
        "id": "WallResultButton",
    },
    className: "WallResultButton",
    on_clicked: () => {
        let highQuailtyImgPath = result.replace("/cached", "");
        Utils.notify("AGS", `Opening file: ${result}`);
        Utils.execAsync(["bash", "-c", `wallpaper.sh "${highQuailtyImgPath}"`]).catch((err) => {
            if (!err) return;
            Utils.execAsync(["bash", "-c", `xdg-open "${highQuailtyImgPath}"`]).catch((err) => {
                if (!err) return;
                Utils.notify("AGS", `Error: ${err}`);
            });
        });
        App.toggleWindow(WINDOW_NAME);
    },
    valign: Gtk.Align.START,
    child: Widget.Box({
        className: "WallResultBox",
        spacing: 10,
        vertical: true,
        children: [
            Widget.Box({
                className: "WallResultBackground",
                css: `background-image: url("${result}"); `,
            }),
            Widget.Box({ vertical: true }),
            Widget.Label({
                className: "WallResultLabel",
                label: `${result.split("/").pop()}`,
                lines: 1,
                wrap: true,
                xalign: 0,
                vpack: "center",
                hpack: "center",
                maxWidthChars: 40,
                truncate: "end",
            }),
        ],
    }),
});

const WallSelector = ({ width = 500, height = 500, spacing = 10 }) => {

    const list = Widget.Box({
        className: "WallSelectorList",
        vertical: true,
        //children: applications,
        spacing,
    });

    const getWalls = (() => {
        let timer;
        return args => {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                try {
                    const result = await Utils.execAsync(["bash", "-c", args]);
                    console.log("fetching results...");
                    if (result) {
                        console.log("Results featched");
                        console.time("Creating Widgets took");
                        const resWid = result.split(/\r?\n/).map(WallResult);
                        let container = [];
                        for (let i = 0; i < resWid.length; i += 3) {
                            let box = Widget.Box({
                                class_name: "WallResultBoxRow",
                                homogeneous: true,
                                className: "WallSelectorList",
                                children: resWid.slice(i, i + 3),
                                spacing: 10,
                            });
                            container.push(box);
                        }
                        list.children = container;
                        console.timeEnd("Creating Widgets took");
                    }
                } catch (err) {
                    if (err) console.log(err);
                }
            }, 300);
        };
    })();

    function onChange({ text }) {
        //Check if the text stats with a ? 
        if (text.startsWith(">")) {
            text = text.replace(">", "");
            if (text === "") return;
            let command;
            if (text.startsWith("/")) {
                let path = text;
                command = `fd --search-path "${path}"\\
                    --max-results 30`;
            }
            else {
                command = `fd -i -p \\
                "${text}" \\
                --base-directory ${Utils.HOME} \\
                --search-path ${Utils.HOME}/walls/cached \\
                --max-results 14 \\
                --extension jpg --extension jpeg --extension png --extension gif --extension bmp`;

            }
            if (text === "") return;
            getWalls(command);
        }
    }

    function onAccept({ text }) {
        if (list.children[0].attribute.id === "WallResultButton") {
            let result = list.children[0].attribute.result;
            Utils.execAsync(["bash", "-c", `xdg - open "${result}" & disown`]).catch((err) => {
                if (!err) return;
                Utils.execAsync(["bash", "-c", `xdg - open "${Utils.HOME}/${result}" & disown`]).catch((err) => {
                    if (!err) return;
                    Utils.notify("AGS", `Error: ${err} `);
                });
            });
            Utils.notify("AGS", `Opening file: ${result} `);
            App.toggleWindow(WINDOW_NAME);
            return;
        }
    }

    // search entry
    const entry = Widget.Entry({
        className: "WallSelectorEntry",
        placeholderText: "Enter application name...",
        capsLockWarning: true,
        hexpand: true,
        css: `margin-bottom: ${spacing}px;`,
        on_accept: ({ text }) => onAccept({ text }),
        on_change: ({ text }) => onChange({ text }),
    });

    const Scrollable = Widget.Scrollable({
        className: "WallSelectorScrollable",
        hscroll: "never",
        child: list,
        //child: gridView,
        minContentHeight: height,
    });


    return Widget.Box({
        vertical: true,
        className: "WallSelectorBox",
        children: [
            entry,
            // wrap the list in a scrollable
            Scrollable,
        ],
        setup: self => {
            self.hook(App, (_, windowName, visible) => {
                if (windowName !== WINDOW_NAME)
                    return;

                // when the WallSelector shows up
                if (visible) {
                    entry.text = "";
                    entry.grab_focus();
                }
            });
        },
    });
};

const WallSelectorRevealer = Widget.Revealer({
    className: "WallSelectorRevealer",
    transition: "slide_up",
    transitionDuration: 300,
    hexpand: true,
    child: Widget.Box({
        className: "WallSelectorRevealerBox",
        child: WallSelector({
            width: 450,
            height: 700,
            spacing: 12,
        }),
    }),
    revealChild: false,
});


export function WallSelectorWindow() {
    const win = Widget.Window({
        className: "WallSelectorWindow",
        name: "WallSelectorWindow",
        anchor: ["bottom"],
        margins: [0, 0, 4, 0],
        widthRequest: 1400,
        heightRequest: 800,
        keymode: "on-demand",
        setup: self => {
            self.hook(App, (_, windowName, visible) => {
                if (windowName !== "WallSelectorWindow")
                    return;
                WallSelectorRevealer.reveal_child = visible ? true : false;
            });
            self.keybind("Escape", () => {
                WallSelectorRevealer.reveal_child = false;
                App.closeWindow("WallSelectorWindow");
            });
        },
        child: Widget.Box({
            className: "WallSelectorWindowBox",
            valign: Gtk.Align.END,
            vertical: true,
            child: WallSelectorRevealer,
        }),
    });
    win.visible = false;
    return win;
}
