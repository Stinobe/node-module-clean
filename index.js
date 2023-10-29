const loading = require("loading-cli");
const { existsSync } = require("fs");
const {
  msgPathNotFound,
  msgPathFound,
  msgPackageInfo,
  msgDirInfo,
} = require("./utils/colors");
const {
  getTargetDirectories,
  getDirectorySize,
  getPackageInfo,
} = require("./utils/dirFinder");
const prompts = require("prompts");
const colors = require("colors-cli");
const directories = [];

const getDirectories = async (paths) => {
  const existingPaths = [];

  // Check if paths exist
  for (path of paths) {
    // Set loading message
    const ldr = loading(`Validating ${path}`).start();
    // Validate existence
    const exists = await existsSync(path);
    if (exists) {
      // If the path exists, push it to the array of existing paths
      existingPaths.push(path);
      // inform the user
      ldr.succeed(msgPathFound(path));
    } else {
      // If it does not exists just inform the user
      ldr.fail(msgPathNotFound(path));
    }
  }

  for (path of existingPaths) {
    const sizeLdr = loading(`Getting information for ${path}`).start();
    const allSubDirs = await getTargetDirectories(path);

    for (sub of allSubDirs) {
      const { path, name } = sub;
      const dirPath = `${path}/${name}`;
      const size = await getDirectorySize(dirPath);
      const pkgInfo = await getPackageInfo(dirPath);
      directories.push({
        parent: path.split("/").pop(),
        path,
        name,
        target: dirPath,
        ...pkgInfo,
        size: size,
      });
    }
    if (allSubDirs.length)
      sizeLdr.succeed(`Found ${allSubDirs.length} directories in ${path}`);
    else sizeLdr.warn(`No packages found in ${path}`);
  }

  console.log(directories);

  directories.sort((subdirA, subdirB) => {
    if (subdirA.parent.toLowerCase() < subdirB.parent.toLowerCase()) return -1;
    if (subdirA.parent.toLowerCase() > subdirB.parent.toLowerCase()) return 1;
    return 0;
  });

  const list = {
    type: "multiselect",
    name: "targetDirectories",
    message: "For which project do you wish to remove installed dependencies?",
    instructions: false,
    choices: directories.map(({ pkgName, version, parent, size, target }) => ({
      title: `${
        pkgName ? msgPackageInfo(pkgName, version, size) : msgDirInfo(parent)
      } ${colors.yellow(
        colors.faint(`(${(size / 1024 / 1024).toFixed(2)} MB)`)
      )}`,
      value: { target, size },
    })),
  };

  const answer = await prompts(list);
  const totalSize = answer.targetDirectories.reduce(
    (acc, current) => acc + current.size,
    0
  );
  console.log(
    (totalSize / 1024 / 1024).toFixed(2),
    "MB would have been removed"
  );
};

const argv = require("minimist")(process.argv.slice(2));
const { _: paths, ...rest } = argv;
getDirectories(paths);
