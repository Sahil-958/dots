const { Gtk } = imports.gi;
import Widget from "resource:///com/github/Aylur/ags/widget.js";

const { Box, Button, Separator } = Widget;
import { DEFAULT_OSK_LAYOUT, oskLayouts } from "./data_keyboardlayouts.js";
import { DEFAULT_OSK_MOUSE_LAYOUT, mouseLayouts } from "./data_mouse.js";

const keyboardLayout = DEFAULT_OSK_LAYOUT;
//const keyboardLayout = "external_keyboard";
const keyboardJson = oskLayouts[keyboardLayout];

const mouseJson = mouseLayouts[DEFAULT_OSK_MOUSE_LAYOUT];

let keyBtn = [];
let mouseBtn = [];

let keyButtons = (row) =>
  row.map((key) => {
    return Button({
      className: `osk-key osk-key-${key.shape}`,
      hexpand: ["space", "expand"].some((e) => key.shape.includes(e)),
      label: key.label,
      canFocus: false,
      attribute: { key: key },
      setup: (button) => {
        button.connect("pressed", () => {
          if (key.key_code == 42 || key.key_code == 54) {
            keyBox.forEach((row) => {
              row.children.forEach((button) => {
                if (button.attribute.key.labelShift)
                  button.label = button.attribute.key.labelShift;
              });
            });
          }
          button.toggleClassName("osk-key-active", true);
        });
        button.connect("released", () => {
          if (key.key_code == 42 || key.key_code == 54) {
            keyBox.forEach((row) => {
              row.children.forEach((button) => {
                if (button.attribute.key.labelShift)
                  button.label = button.attribute.key.label;
              });
            });
          }
          button.toggleClassName("osk-key-active", false);
        });
      },
    });
  });

let keyBox = keyboardJson.keys.map((row) => {
  let buttonRow = keyButtons(row);
  keyBtn.push(...buttonRow);
  return Box({
    vertical: false,
    className: "spacing-h-5",
    children: buttonRow,
  });
});

let mouseKeyButtons = (row) =>
  row.map((key) => {
    return Button({
      className: `osk-mouse-${key.shape}`,
      hexpand: ["left", "right"].includes(key.shape),
      vexpand: ["extra1", "extra2"].includes(key.shape),
      label: key.label,
      canFocus: false,
      attribute: { key: key },
      setup: (button) => {
        button.connect("pressed", () => {
          button.toggleClassName("osk-key-active", true);
        });
        button.connect("released", () => {
          Utils.timeout(0, () => {
            button.toggleClassName("osk-key-active", false);
          });
        });
      },
    });
  });

let primaryMouseButtons = mouseKeyButtons(mouseJson.keys[0]);
let secondaryMouseButtons = mouseKeyButtons(mouseJson.keys[1]);
mouseBtn.push(...primaryMouseButtons);
mouseBtn.push(...secondaryMouseButtons);

let mouseBox = Box({
  className: "osk-mouse",
  width_request: 200,
  vertical: true,
  spacing: 5,
  children: [
    Box({
      spacing: 5,
      children: primaryMouseButtons,
    }),
    Box({
      expand: true,
      spacing: 5,
      children: [
        Box({
          vertical: true,
          spacing: 5,
          children: secondaryMouseButtons,
        }),
        Box({
          hexpand: true,
          className: "osk-mouse-body",
          expand: true,
        }),
      ],
    }),
  ],
});

const keyboard = Box({
  vexpand: true,
  hexpand: true,
  vertical: false,
  className: "osk-window spacing-v-5",
  spacing: 5,
  children: [
    Box({
      className: "osk-body spacing-h-10",
      child: Box({
        vertical: true,
        className: "spacing-v-5",
        children: keyBox,
      }),
    }),
    Separator({
      className: "osk-separator",
      orientation: Gtk.Orientation.VERTICAL,
    }),
    mouseBox,
  ],
});

let KeyboardWindow = new Gtk.Window({
  type: Gtk.WindowType.TOPLEVEL,
  resizable: false,
  title: "KeyboardVisualizer",
  name: "KeyboardVisualizer",
  child: keyboard,
});
KeyboardWindow.show_all();

KeyboardWindow.connect("delete-event", () => {
  Utils.notify({
    summary: "KeyboardVisualizer",
    body: "KeyboardVisualizer is running in the background",
    //iconName: "icon-name",
    actions: {
      show: () => {
        KeyboardWindow.show_all();
        //App.openWindow("KeyboardVisualizer");
      },
      Kill: () => {
        App.Quit();
      },
    },
  });
  //App.closeWindow("KeyboardVisualizer");
  KeyboardWindow.hide();
  return true;
});

Utils.subprocess(
  //  ["bash", "-c", `sudo ${App.configDir}/showmethekey-cli`],
  ["bash", "-c", `pkexec ${App.configDir}/showmethekey-cli`],
  (output) => {
    let { key_code, state_code } = JSON.parse(output);
    let btn =
      keyBtn.find((key) => key.attribute.key.key_code == key_code) ||
      mouseBtn.find((btn) => btn.attribute.key.key_code == key_code);
    if (btn) state_code == 1 ? btn.pressed() : btn.released();
  },
  (err) => console.log(err),
  KeyboardWindow,
);

export default KeyboardWindow;
