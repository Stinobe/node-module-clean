const colors = require("colors-cli/safe");

const icon = colors.white;
const packageName = colors.cyan;
const packageVersion = colors.green;
const at = colors.black_bt.faint("@");

const msgPathFound = (path) => colors.green_bt("Found " + colors.green(path));
const msgPathNotFound = (path) =>
  colors.red_bt("Did not find " + colors.red(path));

const msgPackageInfo = (name, version) =>
  `${packageName(name)}${at}${packageVersion(version)}`;

const msgDirInfo = (name) => colors.cyan(`${name}`);

const msgIcon = () => colors.magenta(colors.faint());

module.exports = {
  msgPathFound,
  msgPathNotFound,
  msgPackageInfo,
  msgDirInfo,
};
