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

const readdir = util.promisify(fs.readdir);
const exists = util.promisify(fs.exists);

(async () => {
  const files = await readdir(path.join(__dirname, "import-sources"));

  for (const file of files) {
    log(`Importing \`${file}\`…`);

    if (file.endsWith(".hints.jsonc")) {
      continue;
    }

    let hints;

    const hintsPath = path.join(
      __dirname,
      "import-sources",
      path.basename(file, ".jsonc") + ".hints.jsonc"
    );

    if (await exists(hintsPath)) {
      hints = await readFileJson(hintsPath);
    } else {
      hints = {};
    }

    const result = transform(
      await readFileJson(path.join(__dirname, "import-sources", file)),
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
        return tokenColor.settings[setting];
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
    neutral: getColor("editor.background")
  };

  const tokens = {
    attributeName: getTokenColor("attributeName", [
      "entity.other.attribute-name"
    ]),
    comment: getTokenColor("comment", ["comment"]),
    constant: getTokenColor("constant", ["variable.other.constant"]),
    function: getTokenColor("function", ["entity.name.function"]),
    keyword: getTokenColor("keyword", ["keyword", "keyword.control"]),
    literal: getTokenColor("literal", ["constant.language"]),
    number: getTokenColor("number", ["constant.numeric"]),
    operator: getTokenColor("operator", ["keyword.operator"]),
    other: getColor("editor.foreground"),
    otherType: getTokenColor("otherType", ["support.type", "support.class"]),
    parameter: getTokenColor("parameter", ["variable.parameter"]),
    propertyName: getTokenColor("propertyName", ["support.type.property-name"]),
    punctuation: getTokenColor("punctuation", ["punctuation"]),
    regex: getTokenColor("regex", ["constant.regexp"]),
    storageType: getTokenColor("storageType", ["storage.type"]),
    string: getTokenColor("string", ["string"]),
    supportFunction: getTokenColor("supportFunction", ["support.function"]),
    supportType: getTokenColor("supportType", [
      "support.type",
      "support.class"
    ]),
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
        chroma: 0
      }
    },
    customizations: {
      accents: ["accent_80_exact", "accent_c0_exact", "accent_exact"],
      tokens: {}
    }
  };

  for (const color of Object.keys(colors)) {
    if (colors[color] === null) {
      logWarning(`Color \`${color}\` is \`null\`.`);
      continue;
    }

    newTheme.colors[color] = { hex: colors[color] };
  }

  for (const token of Object.keys(tokens)) {
    if (tokens[token] === null) {
      logWarning(`Token \`${token}\` is \`null\`.`);
      continue;
    }

    newTheme.colors[token] = { hex: tokens[token] };

    if (token !== "accent") {
      newTheme.customizations.tokens[token] = `${token}_exact`;
    }
  }

  return newTheme;
}
