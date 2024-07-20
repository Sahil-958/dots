import KeyboardWindow from "./onscreenkeyboard.js";
import Gio from "gi://Gio";

applyScss();
Utils.monitorFile(`${App.configDir}/osk.scss`, (_, eventType) => {
  if (eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT) {
    applyScss();
  }
});

function applyScss() {
  // Compile scss
  Utils.exec(`sass ${App.configDir}/osk.scss ${App.configDir}/style.css`);
  // Apply compiled css
  App.resetCss();
  App.applyCss(`${App.configDir}/style.css`);
}

globalThis.showKeyboardVisualizer = () => {
  App.windows.forEach((win) => {
    if (win.name?.includes("KeyboardVisualizer")) {
      App.openWindow(win.name);
    }
  });
};

App.config({
  windows: [KeyboardWindow],
});
