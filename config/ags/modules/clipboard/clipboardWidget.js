import Gtk from "gi://Gtk";
import {
  fetchClips,
  notifyAndCopy,
  notifyAndRemove,
  clips,
  removedClips,
  debounce,
  filterClips,
} from "./clipboardService.js";

const CliphistResult = (clip) => {
  const destroyWithAnims = (onlyUi = false) => {
    secondRevealer.reveal_child = false;
    Utils.timeout(200, () => {
      firstRevealer.reveal_child = false;
      Utils.timeout(200, () => {
        if (!onlyUi) notifyAndRemove(clip);
        revealerBox.destroy();
      });
    });
  };

  const labelWid = Widget.Label({
    className: "CliphistResultLabel",
    useMarkup: true,
    label: clip.label,
    tooltipText: `id:${clip.id}`,
    xalign: 0,
  });

  const eventBox = Widget.EventBox({
    className: "CliphistResultEventBox",
    width_request: 395,
    can_focus: true,
    onPrimaryClick: () => notifyAndCopy(clip),
    onSecondaryClick: () => {
      destroyWithAnims();
    },
    child: Widget.Box({
      className: "CliphistResultBox",
      tooltipText: `id:${clip.id}`,
      vertical: true,
      vexpand: false,
      child: Widget.Scrollable({
        hscroll: "always",
        vscroll: "never",
        child: labelWid,
      }),
      setup: (self) => {
        if (clip.isImage) {
          labelWid.label = `${clip.img.id}.${clip.img.extension} ${clip.img.width}x${clip.img.height} ${clip.img.size}`;
          self.child.hscroll = "never";
          labelWid.vpack = labelWid.hpack = "end";
          labelWid.css = "background-color: rgba(0,0,0,0.5);";
          self.css = `
          background-image: url('file://${clip.img.filePath}');
          min-height: ${Math.min(clip.img.height, 150)}px;
          `;
        }
      },
    }),
    setup: (self) => {
      self.keybind("Return", () => notifyAndCopy(clip));
      self.keybind("d", () => destroyWithAnims());
      self.keybind("h", () => {
        self.child.child.hadjustment.value -= 30;
      });
      self.keybind("l", () => {
        self.child.child.hadjustment.value += 30;
      });
    },
  });

  const secondRevealer = Widget.Revealer({
    child: eventBox,
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
      clip: clip,
      id: clip.id,
      widgetID: "CliphistResultButton",
      toggleWithAnims: toggleWithAnims,
      destroyWithAnims: destroyWithAnims,
      hiddenByAnim: false,
    },
    children: [firstRevealer],
  });

  return revealerBox;
};

const ClipBoard = () => {
  const list = Widget.Box({
    className: "ClipBoardList",
    vertical: true,
    spacing: 10,
    //children: clips.bind().as((c) => c.map(CliphistResult)),
    setup: (self) => {
      self.hook(removedClips, (self) => {
        let removed = removedClips.value;
        removed.forEach((c) => {
          self.children.forEach((child, idx) => {
            if (child.attribute.clip.id === c.id) {
              Utils.timeout(100 * idx, () => {
                child.attribute.destroyWithAnims(true);
              });
            }
          });
        });
      });
      self.hook(clips, (self) => {
        let newClips = clips.value.filter((c) => {
          let isPresent = self.children.some((child) => {
            return child.attribute.clip.id === c.id;
          });
          return !isPresent;
        });
        newClips.forEach((c, idx) => {
          Utils.timeout(100 * idx, () => {
            self.pack_start(CliphistResult(c), false, false, 0);
            //self.pack_end(CliphistResult(c), false, false, 0);
          });
        });
      });
    },
  });

  function onChange({ text }) {
    if (!clips) return;
    let filtered = filterClips(clips, text);
    filtered.nonMatched.forEach((c) => {
      list.children.forEach((child, idx) => {
        if (!child.attribute.hiddenByAnim && child.attribute.clip.id === c.id) {
          Utils.timeout(100 * idx, () => {
            child.attribute.toggleWithAnims(false);
          });
        }
      });
    });
    filtered.matched.forEach((c) => {
      list.children.forEach((child, idx) => {
        if (child.attribute.hiddenByAnim && child.attribute.clip.id === c.id) {
          Utils.timeout(100 * idx, () => {
            child.attribute.toggleWithAnims(true);
          });
        }
      });
    });
  }

  const debouncedOnChange = debounce(onChange, 400);
  function onAccept() {
    if (list.children[0].attribute.widgetID === "CliphistResultButton") {
      let clip = list.children[0].attribute.clip;
      notifyAndCopy(clip);
    }
  }

  // search entry
  const entry = Widget.Entry({
    className: "ClipBoardEntry",
    placeholderText: "Enter Search term...",
    capsLockWarning: true,
    on_accept: () => onAccept(),
    on_change: ({ text }) => debouncedOnChange({ text }),
  });

  const Scrollable = Widget.Scrollable({
    className: "ClipBoardScrollable",
    hscroll: "never",
    expand: true,
    child: list,
  });

  return Widget.Box({
    vertical: true,
    className: "ClipBoardBox",
    spacing: 10,
    children: [entry, Scrollable],
  }).on("realize", () => {
    fetchClips();
  });
};

const ClipBoardContent = ClipBoard();
export default ClipBoardContent;
