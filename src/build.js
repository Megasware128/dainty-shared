const { getConfiguration } = require("./configuration");
const fs = require("fs");
const path = require("path");
const util = require("util");
const { writeFileLog } = require("./utils");
const changeCase = require("change-case");

const readdir = util.promisify(fs.readdir);

(async () => {
  let data = ["const presets = {"];

  const files = await readdir(path.join(__dirname, "../presets"));

  for (const file of files) {
    const preset = file.slice(0, -6);

    if (["_base-dark", "_base-light", "_debug"].includes(preset)) {
      continue;
    }

    const configuration = await getConfiguration(
      __dirname,
      preset,
      null,
      false
    );

    data.push(
      `${changeCase.camelCase(preset)}: ${JSON.stringify(
        configuration,
        null,
        2
      )},`
    );
  }

  data.push(`}; module.exports = { presets };`);

  await writeFileLog(
    path.join(__dirname, "../presets-web.js"),
    data.join("\n")
  );
})();
