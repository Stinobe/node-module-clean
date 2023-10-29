const colors = require("colors-cli/safe");
const { convertFileSize } = require("./convert");

const packageName = colors.cyan;
const packageVersion = colors.green;
const at = colors.black_bt.faint("@");

const msgChain = (...msg) => msg.join("");

const msgPathNotFound = (path) =>
  msgChain(colors.red_bt("Did not find"), " ", colors.red(path));

const msgPackageInfo = (name, version) =>
  msgChain(packageName(name), at, packageVersion(version));

const msgDirInfo = (name) => colors.cyan(`${name}`);

const msgFoundPackage = (found, path) =>
  msgChain(
    colors.green("Found"),
    " ",
    colors.green.bold(found),
    " ",
    colors.green(found === 1 ? "dependency" : "dependencies"),
    colors.green(" in "),
    colors.green_bt(path)
  );

const msgNoPackagesFound = (path) =>
  msgChain(
    colors.yellow_bt("No packages found in"),
    " ",
    colors.yellow_bt(path)
  );

const msgTotalInstalled = (size) =>
  msgChain(
    colors.blue_bt("You have"),
    " ",
    colors.blue.bold(convertFileSize(size)),
    " ",
    colors.blue_bt("of dependencies installed")
  );

const msgRemoving = (name, path) =>
  msgChain(
    colors.green("Removing"),
    " ",
    colors.green.bold(name),
    " ",
    colors.green.faint(path)
  );

const msgRemoved = (name) =>
  msgChain(
    colors.green("Dependencies for"),
    " ",
    colors.green.bold(name),
    " ",
    colors.green("have been removed")
  );

const msgRemovedSize = (removed, total) => {
  const diff = total - removed;
  const percent = ((removed / total) * 100).toFixed(2);
  return msgChain(
    colors.green("Removed"),
    " ",
    colors.green_bt(convertFileSize(removed)),
    " ",
    colors.green.faint.italic(`(${percent}%)`),
    colors.green(", "),
    colors.green_bt(convertFileSize(diff)),
    " ",
    colors.green("remaining")
  );
};

const msgCancelled = colors.green("\uf164 Okay ... we won't then");

module.exports = {
  msgPathNotFound,
  msgPackageInfo,
  msgDirInfo,
  msgFoundPackage,
  msgNoPackagesFound,
  msgTotalInstalled,
  msgRemoving,
  msgCancelled,
  msgRemoved,
  msgRemovedSize,
};
