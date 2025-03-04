import Lock from "gi://GtkSessionLock";
import Gdk from "gi://Gdk?version=3.0";
import Gtk from "gi://Gtk?version=3.0";
import AstalAuth from "gi://AstalAuth";

import {
  RoundedAngleEnd,
  RoundedCorner,
} from "../modules/roundedCorner/index.js";
import Clock from "../modules/clock/index.js";
import SessionBox, {
  SessionBoxTooltip,
} from "../modules/powermenu/sessionbox.js";
import { MprisCorner } from "../modules/mpris/index.js";

Utils.exec(`sass ${App.configDir}/style.scss ${App.configDir}/style.css`);
console.log(`sass ${App.configDir}/style.scss ${App.configDir}/style.css`);
App.applyCss(`${App.configDir}/style.css`);

const auth = new AstalAuth.Pam();
const info = Variable("");
const inputNeeded = Variable(false);
const inputVisible = Variable(false);

auth.connect("auth-info", (auth, msg) => {
  if (msg) {
    loginStatusRevealer.reveal_child = true;
    info.setValue(msg);
  }
  auth.supply_secret(null);
});

auth.connect("auth-error", (auth, msg) => {
  info.setValue(msg);
  console.error(msg);
  auth.supply_secret(null);
});

auth.connect("auth-prompt-visible", (auth, msg) => {
  inputNeeded.setValue(true);
  inputVisible.setValue(true);
  entry.grab_focus();
  entry.text = "";
});

auth.connect("auth-prompt-hidden", (auth, msg) => {
  inputNeeded.setValue(true);
  inputVisible.setValue(false);
  entry.grab_focus();
  entry.text = "";
});

auth.connect("success", unlock);

auth.connect("fail", (p) => {
  entry.parent.toggleClassName("Failed", true);
  loginStatusRevealer.reveal_child = true;
  loginStatusRevealer.child.label = `Authentication Failed: ${p.username}`;
  auth.start_authenticate();
});

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
    windows.forEach((w) => w.window.destroy());
    Gdk.Display.get_default()?.sync();
    App.quit();
  });
}

//Utils.timeout(15000, () => {
//    unlock();
//});

const entry = Widget.Entry({
  class_name: "LoginEntry",
  placeholderText: "Authentication Key",
  primaryIconName: "system-lock-screen-symbolic",
  xalign: 0.5,
  hexpand: true,
  visibility: inputVisible.bind(),
  has_focus: false,
  sensitive: inputNeeded.bind(),
  on_change: (self) => {
    if (!self.text) return;
    self.parent.toggleClassName("Failed", false);
    loginStatusRevealer.reveal_child = false;
  },
  on_accept: (self) => {
    inputNeeded.setValue(false);
    auth.supply_secret(self.text);
  },
}).on("realize", (entry) => entry.grab_focus());

const loginStatusRevealer = Widget.Revealer({
  class_name: "LoginStatusRevealer",
  reveal_child: false,
  transition: "slide_down",
  transition_duration: 400,
  child: Widget.Label({
    class_name: "LoginStatusLabel",
    label: info.bind(),
  }),
});

const LoginBox = () => {
  return Widget.Box({
    class_name: "LoginBox",
    vertical: true,
    spacing: 22,
    children: [
      Widget.Box({
        hexpand: true,
        class_name: "LoginAvatarBox",
        height_request: 140,
        css: ` background-image: url("${App.configDir}/octane_pfp.jpg");`,
      }),
      Widget.Box({
        class_name: "LoginEntryBox",
        hexpand: true,
        vertical: true,
        children: [entry, loginStatusRevealer],
      }),
    ],
  });
};

const overlayChild = Widget.Revealer({
  reveal_child: false,
  transition: "slide_up",
  halign: Gtk.Align.CENTER,
  valign: Gtk.Align.END,
  transition_duration: 800,
  child: Widget.Box({
    class_name: "OverlayRevealerBox",
    width_request: Math.floor(Gdk.Screen.width() / 2.5),
    height_request: Math.floor(Gdk.Screen.height() / 1.5),
    vertical: true,
    children: [
      Widget.Box({
        vexpand: false,
        class_name: "OverlayRevealerBoxChildren",
        vertical: true,
        spacing: 16,
        child: LoginBox(),
      }),
      Widget.Box({ vexpand: true }),
    ],
  }),
}).on("realize", (self) =>
  Utils.idle(() => {
    Utils.timeout(600, () => (self.reveal_child = true));
  }),
);

const Right = () =>
  Widget.Box({
    hpack: "end",
    children: [
      RoundedAngleEnd("topleft", { class_name: "angle", hexpand: true }),
      Clock(),
    ],
  });

const Left = () =>
  Widget.Box({
    children: [
      SessionBox(),
      RoundedAngleEnd("topright", { class_name: "angle" }),
    ],
  });

const Bar = () =>
  Widget.CenterBox({
    start_widget: Left(),
    end_widget: Right(),
  });

const revealerChild = Widget.Box({
  class_name: "LockWindowBackgroundBox",
  vertical: true,
  children: [
    Bar(),
    Widget.Overlay({
      child: overlayChild,
      overlays: [
        SessionBoxTooltip(),
        MprisCorner(),
        RoundedCorner("topleft", { class_name: "corner" }),
        RoundedCorner("topright", { class_name: "corner" }),
      ],
    }),
  ],
});

const winRevealer = Widget.Revealer({
  class_name: "LockWindowRevealer",
  reveal_child: false,
  transition: "crossfade",
  transition_duration: 1000,
  child: revealerChild,
}).on("realize", (self) => Utils.idle(() => (self.reveal_child = true)));

const LockWindow = () => {
  const window = new Gtk.Window({});
  window.child = Widget.Box({
    children: [winRevealer],
  });
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
  windows.map((w) => {
    lock.new_surface(w.window, w.monitor);
    w.window.show();
  });
}

function on_finished() {
  lock.destroy();
  windows.forEach((w) => w.window.destroy());
  Gdk.Display.get_default()?.sync();
  App.quit();
}

// lock.connect("locked", on_locked);
lock.connect("finished", on_finished);
lock_screen();
auth.start_authenticate();
