import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

function fileExists(filename) {
  let file = Gio.File.new_for_path(filename);
  return file.query_exists(null);
}

const clips = Variable("");

function fetchClips() {
  Utils.execAsync(["bash", "-c", "cliphist list"])
    .then((result) => {
      if (result) {
        clips.setValue(result);
      }
    })
    .catch((err) => {
      if (!err) return;
      console.log(err);
    });
}

function clearUnusedImages() {
  let path = `${Utils.HOME}/.cache/cliphist/`;
  let dir = Gio.File.new_for_path(path);
  let enumerator = dir.enumerate_children(
    "standard::name,standard::type",
    Gio.FileQueryInfoFlags.NONE,
    null,
  );

  let fileInfo;
  let files = [];
  while ((fileInfo = enumerator.next_file(null)) !== null) {
    let childFile = enumerator.get_child(fileInfo);
    files.push(childFile);
  }
  clips.value.split(/\r?\n/).forEach((clip) => {
    let m = isImage(clip);
    files.forEach((file) => {
      let filePath = file.get_path();
      if (filePath.endsWith("db")) return;
      if (m && filePath.includes(m.id)) return;
      fileExists(filePath) && file.delete(null);
    });
  });
}

function isImage(clip) {
  const regexPattern =
    /^([0-9]+)\s+(\[\[\s)?binary.*?\s([0-9]+.*)(png|jpeg|jpg|bmp)\s([0-9]+)x([0-9]+)/i;
  const match = clip.match(regexPattern);
  return match
    ? {
        id: match[1],
        size: match[3],
        extension: match[4],
        width: match[5],
        height: match[6],
      }
    : null;
}

Utils.monitorFile(`${Utils.HOME}/.cache/cliphist/db`, (_, __) => {
  fetchClips();
  clearUnusedImages();
});

const CliphistResult = (result) => {
  const btn = Widget.Button({
    attribute: {
      result: result,
      id: "CliphistResultButton",
    },
    className: "CliphistResultButton",
    on_clicked: () => {
      Utils.notify("AGS", `Copied: ${result}`);
      let id = result.split(" ")[0];
      Utils.execAsync(["bash", "-c", `cliphist decode ${id} | wl-copy`]).catch(
        (err) => {
          if (!err) return;
          Utils.notify("AGS", `Error Copying: ${err}`);
          console.log(err);
        },
      );
    },
    onSecondaryClick: () => {
      Utils.notify("AGS", `Removed: ${result}`);
      let id = result.match(/^([0-9]+)\s+/i)[1];
      Utils.execAsync(["bash", "-c", `cliphist delete <<< ${id}`]).catch(
        (err) => {
          if (!err) return;
          Utils.notify("AGS", `Error Removing: ${err}`);
          console.log(err);
        },
      );
    },
    child: Widget.Label({
      className: "CliphistResultLabel",
      label: result,
      lines: 3,
      wrap: true,
      xalign: 0,
      vpack: "center",
      maxWidthChars: 40,
      truncate: "end",
    }),
  });
  const m = isImage(result);
  if (m) {
    btn.child.label = `${m.id}.${m.extension} ${m.width}x${m.height} ${m.size}`;
    btn.child.vpack = "end";
    btn.child.hpack = "end";
    btn.child.css = "background-color: rgba(0,0,0,0.5);";
    let filename = `${Utils.HOME}/.cache/cliphist/${m.id}.${m.extension}`;
    const css = `
          background-image: url('file://${filename}');
          min-height: ${Math.min(m.height, 150)}px;
          `;
    if (fileExists(filename)) {
      btn.css = css;
    } else {
      Utils.execAsync([
        "bash",
        "-c",
        `cliphist decode ${m.id} > ${Utils.HOME}/.cache/cliphist/${m.id}.${m.extension}`,
      ]);
    }
  }

  return btn;
};

const ClipBoard = () => {
  fetchClips();
  const list = Widget.Box({
    className: "ClipBoardList",
    vertical: true,
    spacing: 10,
    children: clips.bind().as((c) => c.split(/\r?\n/).map(CliphistResult)),
  });

  function onChange({ text }) {
    if (!clips) return;
    const filtered = clips.value
      .split(/\r?\n/)
      .filter((clip) => clip.includes(text));
    list.children = filtered.map(CliphistResult);
  }

  function onAccept() {
    if (list.children[0].attribute.id === "CliphistResultButton") {
      let result = list.children[0].attribute.result;
      Utils.notify("AGS", `Copied: ${result}`);
      result = result.split(" ")[0];
      Utils.execAsync([
        "bash",
        "-c",
        `cliphist decode ${result} | wl-copy`,
      ]).catch((err) => {
        if (!err) return;
        Utils.notify("AGS", `Error Copying: ${err}`);
        console.log(err);
      });
      return;
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
  });
};

const ClipBoardContent = ClipBoard();
export default ClipBoardContent;
