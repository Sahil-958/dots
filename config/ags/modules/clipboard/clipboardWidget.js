import Gtk from "gi://Gtk";
import {
  fetchClips,
  notifyAndCopy,
  notifyAndRemove,
  clips,
  debounce,
  filterClips,
} from "./clipboardService.js";

const CliphistResult = (clip) => {
  const labelWid = Widget.Label({
    className: "CliphistResultLabel",
    label: clip.data,
    vexpand: true,
    tooltipText: `id:${clip.id}`,
    xalign: 0,
  });

  const clipBox = Widget.Box({
    className: "CliphistResultButton",
    tooltipText: `id:${clip.id}`,
    vertical: true,
    vexpand: false,
    can_focus: true,
    child: Widget.Scrollable({
      hscroll: "always",
      vscroll: "never",
      child: labelWid,
    }),
  });
  const destroyWithAnims = () => {
    secondRevealer.reveal_child = false;
    Utils.timeout(200, () => {
      firstRevealer.reveal_child = false;
      Utils.timeout(200, () => {
        notifyAndRemove(clip);
        box.destroy();
      });
    });
  };

  const eventBox = Widget.EventBox({
    attribute: {
      clip: clip,
      id: clip.id,
      widgetID: "CliphistResultButton",
    },
    width_request: 380,
    child: clipBox,
    on_hover: (self) => self.child.toggleClassName("hover", true),
    on_hover_lost: (self) => self.child.toggleClassName("hover", false),
    onPrimaryClick: () => notifyAndCopy(clip),
    onSecondaryClick: () => {
      destroyWithAnims();
    },
  });

  if (clip.isImage) {
    labelWid.label = `${clip.imgInfo.id}.${clip.imgInfo.extension} ${clip.imgInfo.width}x${clip.imgInfo.height} ${clip.imgInfo.size}`;
    clipBox.child.hscroll = "never";
    labelWid.vpack = labelWid.hpack = "end";
    labelWid.css = "background-color: rgba(0,0,0,0.5);";
    clipBox.css = `
          background-image: url('file://${clip.imgInfo.filePath}');
          min-height: ${Math.min(clip.imgInfo.height, 150)}px;
          `;
  }
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
      box.show();
      box.attribute.hiddenByAnim = false;
      firstRevealer.reveal_child = state;
    } else {
      secondRevealer.reveal_child = state;
    }

    Utils.timeout(200, () => {
      if (!state) {
        Utils.timeout(200, () => {
          box.hide();
          box.attribute.hiddenByAnim = true;
        });
        firstRevealer.reveal_child = state;
      } else {
        secondRevealer.reveal_child = state;
      }
    });
  };

  let box;
  box = Widget.Box({
    vpack: "start",
    hpack: "end",
    hexpand: true,
    attribute: {
      clip: clip,
      id: clip.id,
      widgetID: "CliphistResultButton",
      toggleWithAnims: toggleWithAnims,
      hiddenByAnim: false,
    },
    children: [firstRevealer],
  });

  return box;
};

const ClipBoard = () => {
  const list = Widget.Box({
    className: "ClipBoardList",
    vertical: true,
    hpack: "center",
    spacing: 10,
    //children: clips.bind().as((c) => c.map(CliphistResult)),
    setup: (self) => {
      self.hook(clips, (self) => {
        let newClips = clips.value.filter((c) => {
          let isPresent = self.children.some((child) => {
            return child.attribute.clip.id === c.id;
          });
          return !isPresent;
        });
        newClips.forEach((c) => {
          self.pack_start(CliphistResult(c), false, false, 0);
          //self.pack_end(CliphistResult(c), false, false, 0);
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
    css: "margin-bottom: 10px;",
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
    className: "spacing-5 ClipBoardBox",
    children: [entry, Scrollable],
  }).on("realize", () => {
    fetchClips();
  });
};

const ClipBoardContent = ClipBoard();
export default ClipBoardContent;
