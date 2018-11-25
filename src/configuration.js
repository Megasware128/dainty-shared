const Ajv = require("ajv");
const betterAjvErrors = require("better-avj-errors");
const fs = require("fs");
const merge = require("lodash.merge");
const path = require("path");
const util = require("util");
const { cloneDeep, writeFileLog, readFileJson } = require("./utils");

const exists = util.promisify(fs.exists);

var ajv = new Ajv({ useDefaults: true, jsonPointers: true });

async function getConfiguration(dirname, preset = null, argument = null) {
  let schema;
  let defaultConfiguration;
  let configurationPreset;
  let configuration;

  try {
    schema = await readFileJson(
      path.join(dirname, "../configuration-schema.json")
    );

    defaultConfiguration = getDefaultConfiguration(schema);

    if (preset) {
      if (!(await exists(path.join(dirname, `../presets/${preset}.json`)))) {
        console.error(`Configuration preset \`${preset}\` was not found.`);
        return null;
      }

      configurationPreset = await readFileJson(
        path.join(dirname, `../presets/${preset}.json`)
      );
    } else {
      configurationPreset = {};
    }

    if (await exists(path.join(dirname, "../configuration.json"))) {
      configuration = await readFileJson(
        path.join(dirname, "../configuration.json")
      );
    } else {
      configuration = defaultConfiguration;

      await writeFileLog(
        path.join(dirname, "../configuration.json"),
        JSON.stringify(configuration, null, 2)
      );
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
    console.error("`configuration.json` is not valid.");
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
  getConfiguration
};
