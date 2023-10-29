#! /usr/bin/env node
const loading = require("loading-cli");
const { existsSync } = require("fs");
const {
  msgPathNotFound,
  msgFoundPackage,
  msgPackageInfo,
  msgDirInfo,
  msgNoPackagesFound,
  msgTotalInstalled,
  msgRemoving,
  msgCancelled,
  msgRemoved,
  msgRemovedSize,
} = require("./utils/colors");
const {
  getTargetDirectories,
  getDirectorySize,
  getPackageInfo,
} = require("./utils/dirFinder");
const prompts = require("prompts");
const colors = require("colors-cli");
const { nativeSync } = require("rimraf");
const { convertFileSize } = require("./utils/convert");
const { resolve } = require("path");
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
      existingPaths.push(resolve(__dirname, path));
      // inform the user
      ldr.stop().clear();
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
      sizeLdr.succeed(msgFoundPackage(allSubDirs.length, path));
    else sizeLdr.warn(msgNoPackagesFound(path));
  }

  if (!directories.length)
    console.log("No packages with installed dependencies found");
  else {
    directories.sort((subdirA, subdirB) => {
      if (subdirA.parent.toLowerCase() < subdirB.parent.toLowerCase())
        return -1;
      if (subdirA.parent.toLowerCase() > subdirB.parent.toLowerCase()) return 1;
      return 0;
    });

    const totalSize = directories.reduce(
      (acc, current) => acc + current.size,
      0
    );
    loading(msgTotalInstalled(totalSize)).info();

    const list = {
      type: "multiselect",
      name: "targetDirectories",
      message:
        "For which project do you wish to remove installed dependencies?",
      instructions: false,
      choices: directories.map(
        ({ pkgName, version, parent, size, target }) => ({
          title: `${
            pkgName
              ? msgPackageInfo(pkgName, version, size)
              : msgDirInfo(parent)
          } ${colors.yellow(
            colors.faint(`(${convertFileSize(size)})`)
          )} ${colors.black_bt(`(${target})`)}`,
          value: { target, size, pkgName, parent },
        })
      ),
    };

    const answer = await prompts(list);

    if (!answer.targetDirectories) console.log(msgCancelled);
    else {
      for (path of answer.targetDirectories) {
        const ldrRemove = loading(
          msgRemoving(path.pkgName || path.parent, path.target)
        ).start();
        try {
          ldrRemove.render();
          await nativeSync(path.target);
          ldrRemove.succeed(msgRemoved(path.pkgName || path.parent));
        } catch (e) {
          ldrRemove.fail(`Failed to remove ${path}`);
        }
      }
      const sizeRemoved = answer.targetDirectories.reduce(
        (acc, current) => acc + current.size,
        0
      );
      loading(msgRemovedSize(sizeRemoved, totalSize)).succeed();
    }
  }
};

const argv = require("minimist")(process.argv.slice(2));
const { _: paths, ...rest } = argv;
getDirectories(paths.length ? paths : [process.cwd()]);
