const { presets } = require("./presets-web");
const changeCase = require("change-case");

for (const preset of Object.keys(presets)) {
  console.log(
    `- ${presets[preset].name} (\`${changeCase.paramCase(preset)}\`)`
  );
}
