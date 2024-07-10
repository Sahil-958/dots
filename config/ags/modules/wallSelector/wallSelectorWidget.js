import Gtk from "gi://Gtk";
import {
  fetchWalls,
  filterwalls,
  copyWallPath,
  updateWallpaper,
  walls,
  debounce,
} from "./wallSelectorService.js";

const wallSelectorResult = (wall) => {
  const labelWid = Widget.Label({
    className: "wallSelectorResultLabel",
    label: wall.fullResPath.split("/").pop(),
    vpack: "end",
    hpack: "fill",
    hexpand: true,
    vexpand: true,
    tooltipText: `${wall.fullResPath}`,
    xalign: 0.5,
  });

  const destroyWithAnims = () => {
    secondRevealer.reveal_child = false;
    Utils.timeout(200, () => {
      firstRevealer.reveal_child = false;
      Utils.timeout(200, () => {
        revealerBox.destroy();
      });
    });
  };
  let containerWidth = wallSelectorContent.get_allocated_width();
  const btn = Widget.Button({
    className: "wallSelectorResultButton",
    can_focus: true,
    width_request: containerWidth,
    onPrimaryClick: () => updateWallpaper(wall),
    onSecondaryClick: () => copyWallPath(wall),
    child: Widget.Box({
      className: "wallSelectorResultBox",
      tooltipText: `${wall.fullResPath}`,
      vertical: true,
      vexpand: false,
      child: labelWid,
      css: `
          background-image: url("file://${wall.cachedPath}");
          min-height: ${Math.min((wall.dimensions.height * containerWidth) / wall.dimensions.width, 200)}px;
          `,
    }),
  });

  const secondRevealer = Widget.Revealer({
    child: btn,
    reveal_child: false,
    transition: "slide_left",
    transition_duration: 200,
    setup: (self) => {
      Utils.timeout(1, () => {
        self.reveal_child = true;
      });
    },
  });

  const firstRevealer = Widget.Revealer({
    child: secondRevealer,
    reveal_child: true,
    transition: "slide_down",
    transition_duration: 200,
  });

  const toggleWithAnims = (state) => {
    if (state) {
      revealerBox.show();
      revealerBox.attribute.hiddenByAnim = false;
      firstRevealer.reveal_child = state;
    } else {
      secondRevealer.reveal_child = state;
    }

    Utils.timeout(200, () => {
      if (!state) {
        Utils.timeout(200, () => {
          revealerBox.hide();
          revealerBox.attribute.hiddenByAnim = true;
        });
        firstRevealer.reveal_child = state;
      } else {
        secondRevealer.reveal_child = state;
      }
    });
  };

  let revealerBox;
  revealerBox = Widget.Box({
    vpack: "start",
    hpack: "end",
    hexpand: true,
    attribute: {
      cachedPath: wall.cachedPath,
      widgetID: "wallSelectorResultButton",
      toggleWithAnims: toggleWithAnims,
      destroyWithAnims: destroyWithAnims,
      hiddenByAnim: false,
    },
    children: [firstRevealer],
  });

  return revealerBox;
};

const wallSelector = () => {
  const list = Widget.Box({
    className: "wallSelectorList",
    vertical: true,
    hexpand: false,
    width_request: 395,
    spacing: 10,
    setup: (self) => {
      self.hook(walls, (self) => {
        let newwalls = walls.value.filter((w) => {
          let isPresent = self.children.some((child) => {
            return child.attribute.cachedPath === w.cachedPath;
          });
          return !isPresent;
        });
        newwalls.forEach((c, idx) => {
          Utils.timeout(170 * idx, () => {
            self.pack_start(wallSelectorResult(c), false, false, 0);
            //self.pack_end(CliphistResult(c), false, false, 0);
          });
        });
      });
    },
  });

  function onChange({ text }) {
    if (!walls) return;
    if (text.startsWith(">")) {
      text = text.replace(">", "").trim();
      if (text === "") return;
      fetchWalls(text);
      list.children.forEach((child, idx) => {
        Utils.timeout(60 * idx, () => {
          child.attribute.destroyWithAnims();
        });
      });
      return;
    }
    let filtered = filterwalls(text);
    filtered.nonMatched.forEach((c) => {
      list.children.forEach((child, idx) => {
        if (
          !child.attribute.hiddenByAnim &&
          child.attribute.cachedPath === c.cachedPath
        ) {
          Utils.timeout(70 * idx, () => {
            child.attribute.toggleWithAnims(false);
          });
        }
      });
    });
    filtered.matched.forEach((c) => {
      list.children.forEach((child, idx) => {
        if (
          child.attribute.hiddenByAnim &&
          child.attribute.cachedPath === c.cachedPath
        ) {
          Utils.timeout(70 * idx, () => {
            child.attribute.toggleWithAnims(true);
          });
        }
      });
    });
  }

  const debouncedOnChange = debounce(onChange, 600);
  function onAccept() {
    if (list.children[0].attribute.widgetID === "CliphistResultButton") {
      let clip = list.children[0].attribute.fullResPath;
      //notifyAndCopy(clip);
    }
  }

  // search entry
  const entry = Widget.Entry({
    className: "wallSelectorEntry",
    placeholderText: "Enter Search term...",
    capsLockWarning: true,
    on_accept: () => onAccept(),
    on_change: ({ text }) => debouncedOnChange({ text }),
  });

  const Scrollable = Widget.Scrollable({
    className: "wallSelectorScrollable",
    hscroll: "never",
    expand: true,
    child: list,
  });

  return Widget.Box({
    vertical: true,
    className: "wallSelectorBox",
    spacing: 10,
    children: [entry, Scrollable],
  }).on("realize", () => {
    fetchWalls();
  });
};

const wallSelectorContent = wallSelector();
export default wallSelectorContent;
