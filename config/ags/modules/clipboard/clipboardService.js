import Gio from "gi://Gio";

const path = `${Utils.HOME}/.cache/cliphist/`;

export function fileExists(filename) {
  let file = Gio.File.new_for_path(filename);
  return file.query_exists(null);
}

export const clips = Variable([]);

export async function fetchClips() {
  try {
    let clipData = clips.value;
    const result = await Utils.execAsync(["bash", "-c", "cliphist list"]);
    if (!result) return;
    const items = result.split(/\r?\n/);
    clipData = clipData.filter((c) => items.some((i) => i.includes(c.id)));

    const newItems = items.filter((item) => {
      const idMatch = item.match(/^([0-9]+)\s+/i);
      if (!idMatch) return false;
      const id = idMatch[1];
      return !clipData.some((clip) => clip.id === id);
    });

    if (newItems.length === 0) return;

    const decodePromises = newItems.map(async (listItem) => {
      const idMatch = listItem.match(/^([0-9]+)\s+/i);
      if (!idMatch) return; // Skip items without a valid id
      const id = idMatch[1];

      const m = getImgInfo(listItem);
      if (!m) {
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
          console.error(`Error decoding clip ${id}:`, err);
        }
      } else {
        const filePath = `${path}/${m.id}.${m.extension}`;
        if (!fileExists(filePath)) {
          try {
            await Utils.execAsync([
              "bash",
              "-c",
              `cliphist decode ${m.id} > "${filePath}"`,
            ]);
          } catch (err) {
            console.error(`Error decoding and saving image ${m.id}:`, err);
          }
        }
        clipData.push({ id: id, listItem: listItem, data: listItem });
      }
    });
    await Promise.all(decodePromises);
    clipData.sort((a, b) => b.id - a.id);
    clips.setValue(clipData);
  } catch (err) {
    console.error("Error fetching clips:", err);
  }
}

export function clearUnusedImages() {
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
  files.forEach((file) => {
    const filePath = file.get_path();
    if (!filePath || filePath.endsWith("db")) return;

    const isReferenced = clips.value.some((clip) => filePath.includes(clip.id));
    if (!isReferenced) {
      try {
        file.delete(null);
      } catch (err) {
        console.error(`Failed to delete file ${filePath}:`, err);
      }
    }
  });
}

export function getImgInfo(clip) {
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
        filePath: `${path}/${match[1]}.${match[4]}`,
      }
    : null;
}

export function notifyAndCopy(clip) {
  Utils.notify("AGS", `Copied: ${clip.listItem}`);
  Utils.execAsync(["bash", "-c", `cliphist decode ${clip.id} | wl-copy`]).catch(
    (err) => {
      if (!err) return;
      Utils.notify("AGS", `Error Copying: ${err}`);
      console.log(err);
    },
  );
}

export function notifyAndRemove(clip) {
  clips.value = clips.value.filter((c) => c.id !== clip.id);
  Utils.notify("AGS", `Removed: ${clip.listItem}`);
  Utils.execAsync(["bash", "-c", `cliphist delete <<< ${clip.id}`]).catch(
    (err) => {
      if (!err) return;
      Utils.notify("AGS", `Error Removing: ${err}`);
      console.log(err);
    },
  );
}

export function filterClips(clips, text) {
  let filtered;
  const patternRegex = /^r\/(.*?)(?:\/(.*))?$/;
  const match = text.match(patternRegex);
  if (match) {
    try {
      if (match[2] === undefined) match[2] = "";
      const regx = new RegExp(match[1], match[2]);
      filtered = clips.value.filter((clip) => regx.test(clip.data));
    } catch (error) {
      console.error("Your Regx Sucks Here's Why:", error.message);
      filtered = clips.value.filter((clip) => clip.data.includes(text));
    }
  } else {
    filtered = clips.value.filter((clip) => clip.data.includes(text));
  }
  return filtered;
}

Utils.monitorFile(`${Utils.HOME}/.cache/cliphist/db`, (_, __) => {
  fetchClips();
  clearUnusedImages();
});
