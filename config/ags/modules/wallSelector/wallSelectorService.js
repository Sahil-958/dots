import Gio from "gi://Gio";
import GdkPixbuf from "gi://GdkPixbuf";

function getDimensions(imagePath) {
  let pixbuf = GdkPixbuf.Pixbuf.new_from_file(imagePath);
  let width = pixbuf.get_width();
  let height = pixbuf.get_height();
  return { width, height, aspectRatio: width / height };
}

export const walls = Variable([]);
const wallDirPath = `${Utils.HOME}/walls/cached/`;
function genCommand(text = ".") {
  return `fd -i -p \\
                "${text}" \\
                --base-directory ${Utils.HOME} \\
                --search-path ${wallDirPath} \\
                --max-results 14 \\
                --extension jpg --extension jpeg --extension png --extension gif --extension bmp`;
}

let isFetching = false;

export async function fetchWalls(text) {
  let command = genCommand(text);
  if (isFetching) {
    console.log("Already fetching walls");
    return;
  }
  isFetching = true;
  try {
    const result = await Utils.execAsync(["bash", "-c", `${command}`]);
    if (!result) return;
    const items = result.split(/\r?\n/);
    const wallData = items.map((item) => {
      return {
        cachedPath: item,
        fullResPath: item.replace("cached/", ""),
        dimensions: getDimensions(item),
      };
    });
    walls.setValue(wallData);
  } catch (err) {
    console.error("Error fetching walls:", err);
  } finally {
    isFetching = false;
  }
}

export const debounce = (fn, ms = 300) => {
  let timeoutId;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(context, args), ms);
  };
};

export function filterwalls(text) {
  const patternRegex = /^r\/(.*?)(?:\/(.*))?$/;
  const match = text.match(patternRegex);
  let matched = [];
  let nonMatched = [];

  if (match) {
    try {
      if (match[2] === undefined) match[2] = "";
      const regx = new RegExp(match[1], match[2]);
      walls.value.forEach((wall) => {
        if (regx.test(wall.cachedPath)) {
          matched.push(wall);
        } else {
          nonMatched.push(wall);
        }
      });
    } catch (error) {
      console.error("Your Regx Sucks Here's Why:", error.message);
      walls.value.forEach((wall) => {
        if (wall.cachedPath.includes(text)) {
          matched.push(wall);
        } else {
          nonMatched.push(wall);
        }
      });
    }
  } else {
    walls.value.forEach((wall) => {
      if (wall.cachedPath.toLowerCase().includes(text.toLowerCase())) {
        matched.push(wall);
      } else {
        nonMatched.push(wall);
      }
    });
  }

  return { matched, nonMatched };
}

export function updateWallpaper(wall) {
  let wallName = wall.fullResPath.split("/").pop();
  Utils.notify("AGS", "Updating Wallpaper to: " + wallName);
  let command = `matugenWall.sh  "${wall.fullResPath}" `;

  Utils.execAsync(["bash", "-c", command]).catch((err) => {
    console.error("Error updating wallpaper:", err);
  });
}

export function copyWallPath(wall) {
  Utils.notify(
    "AGS",
    "Copying Wallpaper Path to Clipboard: " + wall.fullResPath,
  );
  let command = `wl-copy  ${wall.fullResPath}`;

  Utils.execAsync(["bash", "-c", command]).catch((err) => {
    console.error("Error Copying Path:", err);
  });
}