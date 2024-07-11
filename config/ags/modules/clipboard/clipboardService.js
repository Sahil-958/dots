import Gio from "gi://Gio";

export const clips = Variable([]);
export const removedClips = Variable([]);
const path = `${Utils.HOME}/.cache/cliphist/`;
let isFetching = false;

Utils.monitorFile(`${Utils.HOME}/.cache/cliphist/db`, (file, event) => {
  if (event !== Gio.FileMonitorEvent.CHANGES_DONE_HINT) return;
  fetchClips();
  clearUnusedImages();
});

export function fileExists(filename) {
  let file = Gio.File.new_for_path(filename);
  return file.query_exists(null);
}

export async function fetchClips() {
  if (isFetching) return;
  isFetching = true;
  try {
    let clipData = clips.value;
    const result = await Utils.execAsync(["bash", "-c", "cliphist list"]);
    if (!result) {
      removedClips.setValue(clipData);
      clips.setValue([]);
      return;
    }
    const items = result.split(/\r?\n/);
    removedClips.setValue(
      clipData.filter((clip) => {
        return !items.some((item) => item.includes(clip.id));
      }),
    );

    const newItems = items.filter((item) => {
      const id = item.match(/^([0-9]+)\s+/i)[1];
      if (!id) return false;
      return !clipData.some((clip) => clip.id === id);
    });
    if (newItems.length === 0) return;

    const decodePromises = newItems.map(async (listItem) => {
      const idMatch = listItem.match(/^([0-9]+)\s+/i);
      if (!idMatch) return; // Skip items without a valid id
      const id = idMatch[1];
      let newClip;
      const m = getImgInfo(listItem);
      if (!m) {
        try {
          const decodedlistItem = await Utils.execAsync([
            "bash",
            "-c",
            `cliphist decode ${id}`,
          ]);
          let decodedDataItems = decodedlistItem.split(/\r?\n/);
          let processedLabel =
            decodedDataItems.length > 60
              ? decodedDataItems.slice(0, 20).join("\n") +
                "\n\n\n<...TEXT TO LARGE TO DISPLAY...>" +
                "\n<...SEARCH & COPY OPERATIONS ARE " +
                "\nSTILL DONE WITH ORIGINAL TEXT...>\n\n\n" +
                decodedDataItems.slice(-20).join("\n")
              : decodedlistItem;
          newClip = {
            id: id,
            listItem: listItem,
            data: decodedlistItem,
            label: processedLabel,
            isImage: false,
          };
        } catch (err) {
          console.error(`Error decoding clip ${id}:`, err);
        }
      } else {
        const filePath = `${path}/${m.id}.${m.extension}`;
        if (!fileExists(filePath)) {
          try {
            Utils.execAsync([
              "bash",
              "-c",
              `cliphist decode ${m.id} > "${filePath}"`,
            ]);
          } catch (err) {
            console.error(`Error decoding and saving image ${m.id}:`, err);
          }
        }
        newClip = {
          id: id,
          listItem: listItem,
          data: listItem,
          isImage: true,
          img: m,
        };
      }
      clipData.push(newClip);
    });
    await Promise.all(decodePromises);
    clipData = clipData.filter((c) => {
      return items.some((i) => i.includes(c.id));
    });
    clipData.sort((a, b) => b.id - a.id);
    clips.setValue(clipData);
  } catch (err) {
    console.error("Error fetching clips:", err);
  } finally {
    isFetching = false;
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
  Utils.notify("AGS", `Removing: ${clip.listItem}`);
  Utils.execAsync(["bash", "-c", `cliphist delete <<< ${clip.id}`]).catch(
    (err) => {
      if (!err) return;
      Utils.notify("AGS", `Error Removing: ${err}`);
      console.log(err);
    },
  );
}

export const debounce = (fn, ms = 300) => {
  let timeoutId;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(context, args), ms);
  };
};

export function filterClips(clips, text) {
  const patternRegex = /^r\/(.*?)(?:\/(.*))?$/;
  const match = text.match(patternRegex);

  let matched = [];
  let nonMatched = [];

  if (match) {
    try {
      if (match[2] === undefined) match[2] = "";
      const regx = new RegExp(match[1], match[2]);
      clips.value.forEach((clip) => {
        if (
          regx.test(clip.data) ||
          (clip.isImage && regx.test(clip.listItem))
        ) {
          matched.push(clip);
        } else {
          nonMatched.push(clip);
        }
      });
    } catch (error) {
      console.error("Your Regx Sucks Here's Why:", error.message);
      clips.value.forEach((clip) => {
        if (
          clip.data.includes(text) ||
          (clip.isImage && clip.listItem.includes(text))
        ) {
          matched.push(clip);
        } else {
          nonMatched.push(clip);
        }
      });
    }
  } else {
    clips.value.forEach((clip) => {
      if (clip.data.toLowerCase().includes(text.toLowerCase())) {
        matched.push(clip);
      } else {
        nonMatched.push(clip);
      }
    });
  }

  return { matched, nonMatched };
}
