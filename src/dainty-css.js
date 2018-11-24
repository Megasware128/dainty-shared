const fs = require("fs");
const util = require("util");
const path = require("path");

const readFile = util.promisify(fs.readFile);

async function getDaintyCss() {
  return await readFile(path.join(__dirname, "templates/dainty.css"), "utf8");
}

module.exports = {
  getDaintyCss
};
