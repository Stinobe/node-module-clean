const { readdirSync, readFileSync, existsSync } = require("fs");
const { resolve } = require("path");
const getFolderSize = require("get-folder-size");

const getSubDirectories = async (path) =>
  (await readdirSync(resolve(__dirname, path), { withFileTypes: true })).filter(
    (dirent) => dirent.isDirectory()
  );

const getTargetDirectories = async (path) => {
  const directories = [];
  const subdirs = await getSubDirectories(path);

  for (dirent of subdirs) {
    if (dirent.name === "node_modules") directories.push(dirent);
    else
      directories.push(
        ...(await getTargetDirectories(`${dirent.path}/${dirent.name}`))
      );
  }

  return directories;
};

const getDirectorySize = (path) =>
  new Promise((res, reject) => {
    getFolderSize(path, (err, size) => {
      if (err) reject(err);
      res(size);
    });
  });

const getPackageInfo = async (path) => {
  const pkg = resolve(path, "..", "package.json");
  const exists = await existsSync(pkg);
  if (!exists) return {};
  const contents = await readFileSync(pkg);
  const { name, version } = JSON.parse(contents);
  return { pkgName: name, version };
};

const getProjectInfo = async (path) => {
  const { name, version } = await getPackageInfo(path);
  const size = await getDirectorySize(path);
  return {
    name,
    version,
    size: Number((size / 1024 / 1024).toFixed(2)),
  };
};

module.exports = {
  getSubDirectories,
  getDirectorySize,
  getPackageInfo,
  getProjectInfo,
  getTargetDirectories,
};
