const colors = require("colors-cli");

const msgPathFound = (path) => colors.green_bt("Found " + colors.green(path));
const msgPathNotFound = (path) =>
  colors.red_bt("Did not find " + colors.red(path));

module.exports = {
  msgPathFound,
  msgPathNotFound,
};
