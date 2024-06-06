import Gtk from "gi://Gtk";

const WINDOW_NAME = "WallPickerWindow";

/** @param {import('resource:///com/github/Aylur/ags/service/applications.js').Walllication} app */
const WallItem = img => Widget.Button({
    className: "WallItemButton",
    attribute: {
        "id": "WallItemButton",
        "app": img,
    },
    on_clicked: () => {
        App.closeWindow(WINDOW_NAME);
    },
    child: Widget.Box({
        className: "WallItemBox",
        spacing: 10,
        css: `
        background-image: url("${img}");
        min-width: 400px;
        min-height: 150px;
        `,
        setup: self => {
            console.log("inside", img);
        },
    }),
});


const Walllauncher = ({ width = 500, height = 500, spacing = 10 }) => {
    // search entry
    const entry = Widget.Entry({
        className: "WallPickerEntry",
        placeholderText: "Enter wallpaper name...",
        capsLockWarning: true,
        hexpand: true,
        css: `margin-bottom: ${spacing}px;`,
        on_accept: () => onAccept(),
        on_change: ({ text }) => onChange({ text }),
    });

    const Scrollable = Widget.Scrollable({
        className: "WallPickerScrollable",
        hscroll: "never",
        minContentHeight: height,
    });



    let command = `fd -i -p -t f ".png|.jpg|.jpeg" --search-path ${Utils.HOME}/walls --max-results 10`;

    Utils.execAsync(["bash", "-c", command]).then((result) => {
        if (result) {
            let resWidgets = result.split(/\r?\n/).map(WallItem);
            Scrollable.child = Widget.Box({
                children: resWidgets,
            });
        }
    }).catch((err) => {
        print(err);
    });

    function onChange({ text }) {
    }

    function onAccept() { }

    return Widget.Box({
        vertical: true,
        className: "WallPickerBox",
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
                    //repopulate();
                    entry.text = "";
                    entry.grab_focus();
                }
            });
        },
    });
};

const WallPickerRevealer = Widget.Revealer({
    className: "WallPickerRevealer",
    transition: "slide_down",
    transitionDuration: 300,
    child: Widget.Box({
        className: "WallPickerRevealerBox",
        child: Walllauncher({
            width: 800,
            height: 400,
            spacing: 12,
        }),
    }),
    revealChild: true,
});


export function wallpicker() {
    const win = Widget.Window({
        className: "WallPickerWindow",
        name: "WallPickerWindow",
        anchor: ["bottom", "left", "top"],
        margins: [0, 0, 0, 4],
        css: `border: 1px solid red`,
        widthRequest: 1200,
        heightRequest: 800,
        setup: self => {
            self.hook(App, (_, windowName, visible) => {
                if (windowName !== "WallPickerWindow")
                    return;
                if (visible) {
                    WallPickerRevealer.reveal_child = true;
                }
                else {
                    WallPickerRevealer.reveal_child = false;
                }
            });
            self.keybind("Escape", () => {
                WallPickerRevealer.reveal_child = false;
                App.closeWindow("WallPickerWindow");
            });
        },
        keymode: "on-demand",
        valign: Gtk.Align.START,
        visible: true,
        halign: Gtk.Align.CENTER,
        child: Widget.Box({
            className: "WallPickerWindowBox",
            vertical: true,
            child: WallPickerRevealer,
        }),
    });
    win.visible = true;
    return win;
}
