#!/usr/bin/ags -c

import Greetd from "resource:///com/github/Aylur/ags/service/greetd.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import {
  RoundedAngleEnd,
  RoundedCorner,
} from "./modules/roundedCorner/index.js";
import Clock from "./modules/clock/index.js";
import SessionBox from "./modules/powermenu/index.js";
import Gtk from "gi://Gtk?version=3.0";
import Gdk from "gi://Gdk?version=3.0";
import { get_selected_DE } from "./modules/powermenu/index.js";

const lastLoggedUser = Utils.exec([
  "bash",
  "-c",
  "last -n 2 | awk 'NR==2 {print $1}'",
]);

//Utils.exec(`sass ${App.configDir}/style.scss ${App.configDir}/style.css`);
//console.log(`sass ${App.configDir}/style.scss ${App.configDir}/style.css`);
App.applyCss(`${App.configDir}/style.css`);

const state = Variable("username");
const label = Variable("Vamos, amigo! Time to get wild again!");

async function handle_response(res) {
  if (!res) return;
  let next_resp;
  switch (res.type) {
    case "success":
      if (state.value === "starting") {
        overlayChild.reveal_child = false;
        Utils.timeout(overlayChild.transition_duration, App.quit);
      }
      state.value = "starting";
      next_resp = await Greetd.startSession([get_selected_DE()]);
      break;
    case "error":
      if (res.error_type === "auth_error") {
        label.setValue(
          "Authentication failed:" + res.description.split(":").pop(),
        );
        passwordEntry.parent.toggleClassName("Failed", true);
        next_resp = await Greetd.postAuth();
      } else {
        userEntry.parent.toggleClassName("Failed", true);
        Greetd.cancelSession();
        label.setValue(res.description);
        state.value = "username";
      }
      break;
    case "auth_message":
      switch (res.auth_message_type) {
        case "secret":
          state.value = "secret";
          break;
        case "visible":
          state.value = "visible";
          break;
        case "info":
          state.value = "info";
          userEntry.parent.toggleClassName("Failed", false);
          passwordEntry.parent.toggleClassName("Failed", false);
          label.setValue("info:" + res.auth_message);
          next_resp = await Greetd.postAuth();
          break;
        case "error":
          state.value = "error";
          label.setValue("err:" + res.auth_message);
          next_resp = await Greetd.postAuth();
          break;
      }
      break;
  }
  return handle_response(next_resp);
}

const userEntry = Widget.Entry({
  class_name: "LoginEntry",
  xalign: 0.5,
  hexpand: true,
  text: lastLoggedUser,
  placeholder_text: "User",
  on_change: (entry) => {
    entry.parent.toggleClassName("Failed", false);
  },
  on_accept: (entry) => {
    loginStatusRevealer.reveal_child = false;
    Greetd.cancelSession();
    label.setValue("Username updated cancelling previous session");
    Greetd.createSession(entry.text).then(handle_response).catch(console.log);
  },
})
  .hook(state, (entry, state) => {
    if (state !== "username") return;
    entry.grab_focus();
  })
  .on("realize", (entry) => {
    if (!entry.text) return;
    Greetd.createSession(entry.text).then(handle_response).catch(console.log);
    passwordEntry.grab_focus();
  });

const passwordEntry = Widget.Entry({
  class_name: "LoginEntry",
  placeholderText: "Authentication Key",
  primaryIconName: "system-lock-screen-symbolic",
  xalign: 0.5,
  hexpand: true,
  visibility: false,
  sensitive: state.bind().as((val) => val === "secret"),
  on_change: (self) => {
    if (!self.text) return;
    self.parent.toggleClassName("Failed", false);
    loginStatusRevealer.reveal_child = false;
  },
  on_accept: (entry) => {
    Greetd.postAuth(entry.text).then(handle_response).catch(console.log);
  },
}).hook(state, (entry, state) => {
  if (state !== "secret") return;
  entry.grab_focus();
});

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

const loginStatusRevealer = Widget.Revealer({
  class_name: "LoginStatusRevealer",
  reveal_child: false,
  transition: "slide_down",
  transition_duration: 400,
  child: Widget.Label({
    class_name: "LoginStatusLabel",
    label: label.bind(),
  }),
}).hook(label, (self, label) => {
  self.reveal_child = true;
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
        spacing: 10,
        hexpand: true,
        vertical: true,
        children: [
          userEntry,
          Widget.Box({
            vertical: true,
            children: [passwordEntry, loginStatusRevealer],
          }),
        ],
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

const revealerChild = Widget.Box({
  class_name: "LockWindowBackgroundBox",
  vertical: true,
  children: [
    Bar(),
    Widget.Overlay({
      child: overlayChild,
      overlays: [
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

const win = new Gtk.Window({
  name: "greeter",
  child: Widget.Box({
    vertical: true,
    children: [winRevealer],
  }),
});
win.show_all();
