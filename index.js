const loading = require("loading-cli");
const { existsSync } = require("fs");
const { msgPathNotFound, msgPathFound } = require("./utils/colors");
const {
  getTargetDirectories,
  getDirectorySize,
  getPackageInfo,
} = require("./utils/dirFinder");
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
        path,
        ...pkgInfo,
        size: (size / 1024 / 1024).toFixed(2),
      });
    }
    if (allSubDirs.length)
      sizeLdr.succeed(`Found ${allSubDirs.length} directories in ${path}`);
    else sizeLdr.warn(`No packages found in ${path}`);
  }

  console.log(directories);
};

const argv = require("minimist")(process.argv.slice(2));
const { _: paths, ...rest } = argv;
getDirectories(paths);
