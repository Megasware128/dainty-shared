const Ajv = require("ajv");
const betterAjvErrors = require("better-avj-errors");
const fs = require("fs");
const merge = require("lodash.merge");
const path = require("path");
const util = require("util");
const { cloneDeep, writeFileLog, readFileJson } = require("./utils");

const exists = util.promisify(fs.exists);

var ajv = new Ajv({ useDefaults: true, jsonPointers: true });

async function getPresetPath(dirname, preset) {
  if (await exists(path.join(__dirname, `../presets/${preset}.jsonc`))) {
    return path.join(__dirname, `../presets/${preset}.jsonc`);
  } else if (await exists(path.join(dirname, `../presets/${preset}.jsonc`))) {
    return path.join(dirname, `../presets/${preset}.jsonc`);
  } else return null;
}

async function getConfiguration(
  dirname,
  preset = null,
  argument = null,
  createConfigurationFile = true
) {
  let schema;
  let defaultConfiguration;
  let configurationPresetBase;
  let configurationPreset;
  let configuration;

  try {
    sharedSchema = await readFileJson(
      path.join(__dirname, "../configuration-schema.json")
    );

    appSchema = await readFileJson(
      path.join(dirname, "../configuration-schema.json")
    );

    schema = merge(sharedSchema, appSchema);

    defaultConfiguration = getDefaultConfiguration(schema);

    configurationPresetBase = await readFileJson(
      path.join(__dirname, `../presets/dainty.jsonc`)
    );

    if (preset) {
      const presetPath = await getPresetPath(dirname, preset);

      if (presetPath === null) {
        console.error(`Configuration preset \`${preset}\` was not found.`);
        return null;
      }

      configurationPreset = await readFileJson(presetPath);
    } else {
      configurationPreset = {};
    }

    if (await exists(path.join(dirname, "../configuration.jsonc"))) {
      configuration = await readFileJson(
        path.join(dirname, "../configuration.jsonc")
      );
    } else {
      configuration = defaultConfiguration;

      if (createConfigurationFile) {
        await writeFileLog(
          path.join(dirname, "../configuration.jsonc"),
          JSON.stringify(configuration, null, 2)
        );
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error("Could not get configuration.");
  }

  let error = validateConfiguration(schema, configurationPreset);

  if (error) {
    console.error(error);
    console.error(`Configuration preset \`${preset}\` is not valid.`);
    return null;
  }

  error = validateConfiguration(schema, configuration);

  if (error) {
    console.error(error);
    console.error("`configuration.jsonc` is not valid.");
    return null;
  }

  if (argument !== null) {
    error = validateConfiguration(schema, argument);

    if (error) {
      console.error(`Configuration argument is not valid.`);
      console.error(error);
      return null;
    }
  }

  return merge(
    {},
    defaultConfiguration,
    configurationPresetBase,
    configurationPreset,
    configuration,
    argument ? argument : {}
  );
}

function validateConfiguration(schema, configuration) {
  let configuration_ = cloneDeep(configuration);
  const validate = ajv.compile(schema);
  const valid = validate(configuration_);

  if (!valid) {
    const print = betterAjvErrors({ schema, mode: "return", indent: 2 });
    return print(configuration_, validate.errors);
  } else {
    return null;
  }
}

function getDefaultConfiguration(configurationSchema) {
  let defaultConfiguration = {};
  const validate = ajv.compile(configurationSchema);
  validate(defaultConfiguration);
  return defaultConfiguration;
}

module.exports = {
  getConfiguration,
  getDefaultConfiguration
};
