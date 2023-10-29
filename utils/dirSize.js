const getSize = require("get-folder-size");

const getSizePromise = (myFolder) => {
  return new Promise((resolve, reject) => {
    getSize(myFolder, (err, size) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(size);
    });
  });
};

module.exports = getSizePromise;
