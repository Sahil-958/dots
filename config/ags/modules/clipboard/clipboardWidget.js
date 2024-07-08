import Gtk from "gi://Gtk";
import {
  fetchClips,
  getImgInfo,
  notifyAndCopy,
  notifyAndRemove,
  clips,
  filterClips,
} from "./clipboardService.js";

const CliphistResult = (clip) => {
  const labelWid = Widget.Label({
    className: "CliphistResultLabel",
    label: clip.data,
    tooltipText: `id:${clip.id}`,
    vexpand: true,
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

  const eventBox = Widget.EventBox({
    attribute: {
      clip: clip,
      id: clip.id,
      widgetID: "CliphistResultButton",
    },
    child: clipBox,
    on_hover: (self) => self.child.toggleClassName("hover", true),
    on_hover_lost: (self) => self.child.toggleClassName("hover", false),
    onPrimaryClick: () => notifyAndCopy(clip),
    onSecondaryClick: () => notifyAndRemove(clip),
  });

  const m = getImgInfo(clip.listItem);
  if (m) {
    labelWid.label = `${m.id}.${m.extension} ${m.width}x${m.height} ${m.size}`;
    clipBox.child.hscroll = "never";
    labelWid.vpack = labelWid.hpack = "end";
    labelWid.css = "background-color: rgba(0,0,0,0.5);";
    clipBox.css = `
          background-image: url('file://${m.filePath}');
          min-height: ${Math.min(m.height, 150)}px;
          `;
  }
  return eventBox;
};

const ClipBoard = () => {
  const list = Widget.Box({
    className: "ClipBoardList",
    vertical: true,
    spacing: 10,
    children: clips.bind().as((c) => c.map(CliphistResult)),
  });

  function onChange({ text }) {
    if (!clips) return;
    let filtered = filterClips(clips, text);
    list.children = filtered.map(CliphistResult);
  }

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
    hexpand: true,
    css: "margin-bottom: 10px;",
    on_accept: () => onAccept(),
    on_change: ({ text }) => onChange({ text }),
  });

  const Scrollable = Widget.Scrollable({
    className: "ClipBoardScrollable",
    hscroll: "never",
    expand: true,
    child: list,
  });

  return Widget.Box({
    vertical: true,
    vexpand: true,
    className: "spacing-5 ClipBoardBox",
    children: [entry, Scrollable],
  }).on("realize", () => {
    fetchClips();
  });
};

const ClipBoardContent = ClipBoard();
export default ClipBoardContent;
