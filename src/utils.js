const fs = require("fs");
const exec = require("child_process").exec;
const util = require("util");
const path = require("path");
const replaceOnce = require("replace-once");
const appDataPath_ = require("appdata-path");
const decomment = require("decomment");
const parseJson = require("parse-json");
const chalk = require("chalk");

const execAsync = util.promisify(exec);
const exists = util.promisify(fs.exists);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

function pluralize(str, n) {
  return n === 1 ? str : `${str}s`;
}

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function zip(filenamesData) {
  const nodeZip = new require("node-zip")();

  for (const filenameData of filenamesData) {
    nodeZip.file(filenameData[0], filenameData[1]);
  }

  return nodeZip.generate({ base64: false, compression: "DEFLATE" });
}

async function createDistDirectory(dirname) {
  if (!(await exists(path.join(dirname, "../dist")))) {
    await mkdir(path.join(dirname, "../dist"));
  }
}

async function createBackupDirectory(dirname) {
  if (!(await exists(path.join(dirname, "../backup")))) {
    await mkdir(path.join(dirname, "../backup"));
  }
}

async function backupFile(dirname, source) {
  if (!(await exists(source))) {
    return;
  }

  await createBackupDirectory(dirname);

  await writeFileLog(
    path.join(
      dirname,
      `../backup/${path.basename(source)}_${new Date().getTime()}${path.extname(
        source
      )}`
    ),
    await readFile(source, "utf8")
  );
}

function backticks(str) {
  return `\`${str}\``;
}

function log(message) {
  console.log(`${chalk.dim("–")} ${message}`);
}

function logTransform(source) {
  log(`Transforming ${backticks(path.basename(source))}`);
}

function logWarning(message) {
  console.log(chalk.yellow.bold(`  ${message}`));
}

async function writeFileLog(...args) {
  log(`Writing to ${backticks(path.relative(process.cwd(), args[0]))}…`);

  await writeFile(...args);

  console.log(
    chalk.green.bold(
      `✓ Done writing to ${backticks(path.relative(process.cwd(), args[0]))}.`
    )
  );
}

function identity(value) {
  return value;
}

function applyReplacements(
  content,
  replacements,
  prepareFind = identity,
  prepareReplace = identity
) {
  const find = replacements.map(r => prepareFind(r[0]));
  const replace = replacements.map(r => prepareReplace(r[1]));

  return replaceOnce(content, find, replace, "g");
}

function groupBy(items, key) {
  return items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item]
    }),
    {}
  );
}

async function readFileJson(filename) {
  try {
    return parseJson(decomment(await readFile(filename, "utf8")));
  } catch (error) {
    console.error(error);
    throw new Error(`Could not read JSON file \`${filename}\`.`);
  }
}

async function appDataPath(windowsSubPath = "Roaming") {
  const path = appDataPath_();

  if (process.platform === "windows" || process.platform === "win32") {
    return path.replace(new RegExp("Roaming$"), windowsSubPath);
  } else if (process.platform === "linux") {
    const uname = await execAsync(`uname -a`);

    if (uname.error) {
      throw new Error(`Failed to exec \`uname -a\``);
    }

    if (uname.stdout.includes("Microsoft")) {
      const cmd = await execAsync(`cmd.exe /c "echo %APPDATA%"`);

      if (cmd.error) {
        throw new Error(`Failed to exec \`cmd.exe /c "echo %APPDATA%"\``);
      }

      const wslpath = await execAsync(`wslpath "${cmd.stdout.trimRight()}"`);

      if (wslpath.error) {
        throw new Error(`Failed to exec \`wslpath "${cmd.stdout}"\``);
      }

      return wslpath.stdout
        .slice(0, -1)
        .replace(new RegExp("Roaming$"), windowsSubPath);
    }
  }

  return path;
}

module.exports = {
  backupFile,
  readFileJson,
  appDataPath,
  applyReplacements,
  cloneDeep,
  groupBy,
  createDistDirectory,
  createBackupDirectory,
  writeFileLog,
  zip,
  log,
  logTransform,
  logWarning,
  pluralize
};
