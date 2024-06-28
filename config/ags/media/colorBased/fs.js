export const exists = (path) =>
    Utils.readFileAsync(path)
        .then(() => true)
        .catch(() => false);
export const existsSync = (path) => {
    try {
        return Boolean(Utils.readFile(path));
    } catch {
        return false;
    }
};
