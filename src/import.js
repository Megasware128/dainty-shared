const fs = require("fs");
const path = require("path");
const util = require("util");
const {
  writeFileLog,
  readFileJson,
  log,
  logWarning,
  pluralize
} = require("./utils");
const { adjustChroma } = require("./colors");
const changeCase = require("change-case");

const readdir = util.promisify(fs.readdir);
const exists = util.promisify(fs.exists);

(async () => {
  const files = await readdir(path.join(__dirname, "sources-import"));

  for (const file of files) {
    log(`Importing \`${file}\`…`);

    if (file.endsWith(".hints.jsonc")) {
      continue;
    }

    let hints;

    const hintsPath = path.join(
      __dirname,
      "sources-import",
      path.basename(file, ".jsonc") + ".hints.jsonc"
    );

    if (await exists(hintsPath)) {
      hints = await readFileJson(hintsPath);
    } else {
      hints = {};
    }

    const result = transform(
      await readFileJson(path.join(__dirname, "sources-import", file)),
      hints
    );

    await writeFileLog(
      path.join(__dirname, "../presets", file),
      JSON.stringify(result, null, 2)
    );

    console.log();
  }
})();

function getPropertyFunction(object) {
  return property => {
    if (!object[property]) {
      logWarning(`Property \`${property}\` not found.`);
      return null;
    } else {
      return object[property];
    }
  };
}

function getScopesArray(scope) {
  if (Array.isArray(scope)) {
    return scope;
  } else if (typeof scope === "string") {
    if (scope.includes(",")) {
      return scope.split(",");
    } else {
      return [scope];
    }
  }
}

function getTokenColorFunction(tokenColors, hints) {
  return (token, scopes, setting = "foreground") => {
    let scopes_;

    if (hints.tokens && Object.keys(hints.tokens).includes(token)) {
      scopes_ = [hints.tokens[token]];
    } else {
      scopes_ = Array.isArray(scopes) ? scopes : [scopes];
    }

    for (const scope of scopes_) {
      const tokenColor = tokenColors.find(t =>
        getScopesArray(t.scope).includes(scope)
      );

      if (tokenColor && tokenColor.settings && tokenColor.settings[setting]) {
        return tokenColor.settings[setting].toLowerCase();
      }
    }

    logWarning(
      `Token with ${pluralize("scope", scopes_.length)} \`${scopes_.join(
        ", "
      )}\` not found.`
    );
    return null;
  };
}

function transform(theme, hints) {
  const getProperty = getPropertyFunction(theme);
  const getColor = getPropertyFunction(theme.colors);
  const getTokenColor = getTokenColorFunction(theme.tokenColors, hints);

  const colors = {
    accent: getTokenColor("function", ["entity.name.function"]),
    red: getColor("terminal.ansiRed"),
    yellow: getColor("terminal.ansiYellow"),
    green: getColor("terminal.ansiGreen"),
    cyan: getColor("terminal.ansiCyan"),
    neutral: getColor("editor.background"),
    blue: getColor("terminal.ansiBlue"),
    blueLessChroma: getColor("terminal.ansiBlue")
      ? adjustChroma(getColor("terminal.ansiBlue"), -12.5)
      : null,
    blueMoreChroma: getColor("terminal.ansiBlue")
      ? adjustChroma(getColor("terminal.ansiBlue"), 12.5)
      : null,
    purple: getColor("terminal.ansiMagenta"),

    brightRed: getColor("terminal.ansiBrightRed"),
    brightYellow: getColor("terminal.ansiBrightYellow"),
    brightGreen: getColor("terminal.ansiBrightGreen"),
    brightCyan: getColor("terminal.ansiBrightCyan"),
    brightBlue: getColor("terminal.ansiBrightBlue"),
    brightPurple: getColor("terminal.ansiBrightMagenta")
  };

  const tokens = {
    attributeName: getTokenColor("attributeName", [
      "entity.other.attribute-name"
    ]),
    comment: getTokenColor("comment", ["comment"]),
    constant: getTokenColor("constant", [
      "constant",
      "variable.other.constant"
    ]),
    function: getTokenColor("function", ["entity.name.function"]),
    jsxTag: getTokenColor("jsxTag", ["support.class.component.js"]),
    keyword: getTokenColor("keyword", ["keyword", "keyword.control"]),
    literal: getTokenColor("literal", ["constant.language"]),
    number: getTokenColor("number", ["constant.numeric"]),
    operator: getTokenColor("operator", ["keyword.operator"]),
    other: getColor("editor.foreground"),
    otherType: getTokenColor("otherType", ["support.type", "support.class"]),
    parameter: getTokenColor("parameter", ["variable.parameter"]),
    property: getTokenColor("property", ["support.type.property-name"]),
    punctuation: getTokenColor("punctuation", ["punctuation"]),
    regex: getTokenColor("regex", ["constant.regexp"]),
    storageType: getTokenColor("storageType", ["storage.type", "storage"]),
    storageTypeFunction: getTokenColor("storageTypeFunction", [
      "storage.type.function",
      "storage.type",
      "storage"
    ]),
    string: getTokenColor("string", ["string"]),
    stringTemplate: getTokenColor("stringTemplate", [
      "string.template",
      "string"
    ]),
    supportFunction: getTokenColor("supportFunction", [
      "support.function",
      "support"
    ]),
    supportType: getTokenColor("supportType", [
      "support.type",
      "support.class",
      "support"
    ]),
    tag: getTokenColor("tag", ["entity.name.tag"]),
    type: getTokenColor("type", ["entity.name.type"]),
    url: getColor("textLink.foreground"),
    variable: getTokenColor("variable", ["variable"]),
    variableProperty: getTokenColor("variableProperty", [
      "variable.other.property"
    ])
  };

  let newTheme = {
    name: getProperty("name"),
    type: getProperty("type"),
    colors: {
      _all: {
        lightnessStart: 0,
        chroma: 0,
        filter: {}
      }
    },
    customizations: {
      terminal: {},
      tokens: {}
    }
  };

  for (const color of Object.keys(colors)) {
    if (colors[color] === null) {
      logWarning(`Color \`${color}\` is \`null\`.`);
      continue;
    }

    newTheme.colors[color] = { hex: colors[color] };

    if (color === "accent") {
      newTheme.customizations.accents = [
        "accent_a0_exact",
        "accent_d0_exact",
        "accent_exact"
      ];
    }

    if (
      ["red", "green", "yellow", "blue", "magenta", "cyan"].includes(color) ||
      color.startsWith("bright")
    ) {
      newTheme.customizations.terminal[color] = `${color}_exact`;
    }
  }

  for (const token of Object.keys(tokens)) {
    if (tokens[token] === null) {
      logWarning(`Token \`${token}\` is \`null\`.`);
      continue;
    }

    const propertyName = getPropertyName("token", token);

    newTheme.colors[propertyName] = {
      hex: tokens[token]
    };

    newTheme.customizations.tokens[token] = `${propertyName}_exact`;
  }

  if (getColor("editorCursor.foreground")) {
    newTheme.colors.cursor = { hex: getColor("editorCursor.foreground") };
    newTheme.customizations.cursor = "cursor_exact";
  }

  return newTheme;
}

function getPropertyName(section, property) {
  return `${section}${changeCase.pascalCase(property)}`;
}
