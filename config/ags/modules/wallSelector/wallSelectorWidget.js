import Gtk from "gi://Gtk";
import {
  fetchWalls,
  filterwalls,
  copyWallPath,
  updateWallpaper,
  walls,
  filtered,
  debounce,
} from "./wallSelectorService.js";

const Wall = (wall, frState = true, srState = true) => {
  const labelWid = Widget.Label({
    className: "WallLabel",
    label: wall.name,
    wrap: true,
    maxWidthChars: 40,
    truncate: "end",
    vpack: "end",
    hpack: "center",
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
  const btn = Widget.Button({
    className: "WallButton",
    can_focus: true,
    width_request: 395,
    onPrimaryClick: () => updateWallpaper(wall),
    onSecondaryClick: () => copyWallPath(wall),
    child: Widget.Box({
      className: "WallBox",
      tooltipText: `${wall.fullResPath}`,
      vertical: true,
      vexpand: false,
      child: labelWid,
      setup: (self) => {
        let dimensions = wall.dimensions(wall.cachedPath);
        self.css = `
          background-image: url("file://${wall.cachedPath}");
          min-height: ${Math.min((dimensions.height * 395) / dimensions.width, 200)}px;
          `;
      },
    }),
  });

  const secondRevealer = Widget.Revealer({
    child: btn,
    reveal_child: false,
    transition: "slide_left",
    transition_duration: 200,
    setup: (self) => {
      Utils.timeout(1, () => {
        self.reveal_child = srState;
      });
    },
  });

  const firstRevealer = Widget.Revealer({
    child: secondRevealer,
    reveal_child: frState,
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
      widgetID: "WallButton",
      toggleWithAnims: toggleWithAnims,
      destroyWithAnims: destroyWithAnims,
      hiddenByAnim: false,
    },
    children: [firstRevealer],
  });

  return revealerBox;
};

const wallSelector = () => {
  let page = 0;
  let totalPages = 0;
  let pageStateLabel = Variable("");
  const wallPerPage = 6;
  let isRunning = false; // Flag to indicate if the function is running

  function emptyList(isPrev, INC) {
    list.children.forEach((child, idx) => {
      let cond = isPrev ? idx >= 0 : idx <= INC - 1;
      let delay = isPrev ? 70 * (INC - idx) : 40 * idx;
      if (cond) {
        Utils.timeout(delay, () => {
          child.attribute.destroyWithAnims();
        });
      }
    });
  }

  function addToList(isPrev = false) {
    let matched = filtered.value.matched;
    let wallsToLoad = matched.length > 0 ? matched : walls.value;
    isPrev ? (page -= 1) : (page += 1);
    if (page < 1) {
      page = 1;
      return;
    }
    totalPages = Math.ceil(wallsToLoad.length / wallPerPage);

    if (wallsToLoad.length < wallPerPage) {
      page = 1 * page;
    }

    if (page > totalPages) {
      page = totalPages;
      return;
    }
    let offset = page * wallPerPage;

    if (isRunning) {
      console.log("isRunning", isRunning);
      return;
    }

    pageStateLabel.value = `Page ${page} of ${totalPages}`;
    isRunning = true; // Set the flag to indicate the function is running
    emptyList(isPrev, wallPerPage);

    let toLoad = wallsToLoad.slice(offset - wallPerPage, offset);
    toLoad.forEach((c, idx) => {
      let delay = isPrev ? 40 * idx : 70 * idx;
      Utils.timeout(delay, () => {
        if (isPrev) {
          let wall = Wall(c, false, false);
          list.pack_start(wall, false, false, 0);
          list.reorder_child(wall, 0);
          wall.attribute.toggleWithAnims(true);
        } else {
          let wall = Wall(c);
          list.pack_start(wall, false, false, 0);
        }
        if (idx === toLoad.length - 1) {
          isRunning = false;
        }
      });
    });

    if (toLoad.length === 0) {
      isRunning = false;
    }
  }

  const debouncedAddToList = debounce(addToList, 200);

  const list = Widget.Box({
    className: "wallSelectorList",
    vertical: true,
    hexpand: false,
    width_request: 395,
    spacing: 10,
    setup: (self) => {
      self.hook(walls, (self) => {
        debouncedAddToList(false);
      });
    },
  });

  function onChange({ text }) {
    if (!walls || !text) {
      return;
    }
    page = 0;
    filterwalls(text);
    debouncedAddToList();
  }

  const debouncedOnChange = debounce(onChange, 600);
  function onAccept() {
    if (list.children[0].attribute.widgetID === "WallButton") {
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

  const statsBox = Widget.Box({
    className: "wallSelectorStatsBox",
    children: [
      Widget.Label({
        label: pageStateLabel.bind().as((c) => c),
      }),
    ],
  });

  const Scrollable = Widget.Scrollable({
    className: "wallSelectorScrollable",
    hscroll: "never",
    expand: true,
    child: list,
  }).on("edge-overshot", (self, pos) => {
    if (pos === Gtk.PositionType.BOTTOM) {
      debouncedAddToList(false);
    } else if (pos === Gtk.PositionType.TOP) {
      debouncedAddToList(true);
    }
  });

  return Widget.Box({
    vertical: true,
    className: "wallSelectorBox",
    spacing: 10,
    children: [entry, Scrollable, statsBox],
  }).on("realize", () => {
    fetchWalls();
  });
};

const wallSelectorContent = wallSelector();
export default wallSelectorContent;
