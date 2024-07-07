import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

function fileExists(filename) {
  let file = Gio.File.new_for_path(filename);
  return file.query_exists(null);
}

const clips = Variable([]);

async function fetchClips() {
  try {
    const clipData = [];
    const result = await Utils.execAsync(["bash", "-c", "cliphist list"]);

    if (result) {
      const items = result.split(/\r?\n/);
      const decodePromises = items.map(async (listItem) => {
        let id = listItem.match(/^([0-9]+)\s+/i)[1];
        const isImage = getImgInfo(listItem);
        if (!isImage) {
          try {
            const decodedlistItem = await Utils.execAsync([
              "bash",
              "-c",
              `cliphist decode ${id}`,
            ]);
            clipData.push({
              id: id,
              listItem: listItem,
              data: decodedlistItem,
            });
          } catch (err) {
            console.error(err);
          }
        } else {
          clipData.push({ id: id, listItem: listItem, data: listItem });
        }
      });

      await Promise.all(decodePromises);
      //sort clipData by id
      clipData.sort((a, b) => b.id - a.id);
      clips.setValue(clipData);
    }
  } catch (err) {
    console.error(err);
  }
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
  clips.value.forEach((clip) => {
    let m = getImgInfo(clip.listItem);
    files.forEach((file) => {
      let filePath = file.get_path();
      if (filePath.endsWith("db") || (m && filePath.includes(m.id))) return;
      fileExists(filePath) && file.delete(null);
    });
  });
}

function getImgInfo(clip) {
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

const CliphistResult = (clip) => {
  const btn = Widget.Button({
    attribute: {
      clip: clip,
      id: clip.id,
      widgetID: "CliphistResultButton",
    },
    className: "CliphistResultButton",
    on_clicked: () => {
      Utils.notify("AGS", `Copied: ${clip.listItem}`);
      Utils.execAsync([
        "bash",
        "-c",
        `cliphist decode ${clip.id} | wl-copy`,
      ]).catch((err) => {
        if (!err) return;
        Utils.notify("AGS", `Error Copying: ${err}`);
        console.log(err);
      });
    },
    onSecondaryClick: () => {
      Utils.notify("AGS", `Removed: ${clip.listItem}`);
      Utils.execAsync(["bash", "-c", `cliphist delete <<< ${clip.id}`]).catch(
        (err) => {
          if (!err) return;
          Utils.notify("AGS", `Error Removing: ${err}`);
          console.log(err);
        },
      );
    },
    tooltipText: clip.id,
    child: Widget.Label({
      className: "CliphistResultLabel",
      label: clip.data,
      tooltipText: clip.id,
      xalign: 0,
      wrap: true,
      maxWidthChars: 100,
      vpack: "center",
      truncate: "end",
    }),
  });
  const m = getImgInfo(clip.listItem);
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
  const list = Widget.Box({
    className: "ClipBoardList",
    vertical: true,
    spacing: 10,
    children: clips.bind().as((c) => c.map(CliphistResult)),
  });

  function onChange({ text }) {
    if (!clips) return;
    const filtered = clips.value.filter((clip) => clip.data.includes(text));
    list.children = filtered.map(CliphistResult);
  }

  function onAccept() {
    if (list.children[0].attribute.widgetID === "CliphistResultButton") {
      let clip = list.children[0].attribute.clip;
      Utils.notify("AGS", `Copied: ${clip.listItem}`);
      Utils.execAsync([
        "bash",
        "-c",
        `cliphist decode ${clip.id} | wl-copy`,
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
  }).on("realize", () => {
    fetchClips();
  });
};

const ClipBoardContent = ClipBoard();
export default ClipBoardContent;
