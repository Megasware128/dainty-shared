const culori = require("culori");
const changeCase = require("change-case");
const { groupBy, identity } = require("./utils-universal");

const maximumLightness = 100;
const maximumChroma = 131.207;

let colorsCount = [];
let isTrackingColorsCount = false;

function getInternalColor(color) {
  if (color.hex) {
    const lchColor = culori.lch(color.hex);

    return {
      ...color,
      chroma: (lchColor.c / maximumChroma) * 100,
      hue: lchColor.h
    };
  } else {
    return color;
  }
}

function getLightness(i, color, all) {
  const allLightness = all.lightness ? all.lightness : 0;
  const allLightnessStart = all.lightnessStart ? all.lightnessStart : 0;
  const allLightnessEnd = all.lightnessEnd ? all.lightnessEnd : 0;

  const lightness = color.lightness
    ? color.lightness + allLightness
    : allLightness;
  const lightnessStart = color.lightnessStart
    ? color.lightnessStart + allLightnessStart
    : allLightnessStart;
  const lightnessEnd = color.lightnessEnd
    ? color.lightnessEnd + allLightnessEnd
    : allLightnessEnd;

  return (
    maximumLightness -
    (maximumLightness / 40) * (40 - i) +
    lightness +
    (lightnessStart / 40) * (40 - i) +
    (lightnessEnd / 40) * i
  );
}

function getChroma(i, color, all) {
  const allChroma = all.chroma ? all.chroma : 0;
  const allChromaStart = all.chromaStart ? all.chromaStart : 0;
  const allChromaEnd = all.chromaEnd ? all.chromaEnd : 0;

  const chroma = color.chroma + allChroma;
  const chromaStart = color.chromaStart ? color.chromaStart : allChromaStart;
  const chromaEnd = color.chromaEnd ? color.chromaEnd : allChromaEnd;

  return (
    (maximumChroma / 100) * chroma +
    (maximumChroma / 100) * (chromaStart / 40) * (40 - i) +
    (maximumChroma / 100) * (chromaEnd / 40) * i
  );
}

function generateColorScale(scale, color, all) {
  const color_ = getInternalColor(color);

  let shades = [];

  for (let i = 0; i <= 40; i++) {
    shades.push({
      mode: "lch",
      l: limitLightness(scale, i, getLightness(i, color_, all)),
      c: limitChroma(scale, i, getChroma(i, color_, all)),
      h: color_.hue
    });
  }

  const handler = {
    get: (target, propertyKey, reciever) => {
      if (isTrackingColorsCount) {
        if (propertyKey !== "length" && propertyKey !== "entries") {
          increaseColorCount(scale, propertyKey);
        }
      }

      return Reflect.get(target, propertyKey, reciever);
    }
  };

  return new Proxy(shades.map(culori.formatter("hex")), handler);
}

function limitLightness(scale, i, lightness) {
  if (lightness < 0) {
    console.warn(
      `Calculated LCh lightness \`${lightness}\` for \`${scale}${i}\` is out of range, and has been set to \`0\`.`
    );
  } else if (lightness > maximumLightness) {
    console.warn(
      `Calculated LCh lightness \`${lightness}\` for \`${scale}${i}\` is out of range, and has been set to \`${maximumLightness}\`.`
    );
  }

  return Math.max(Math.min(lightness, maximumLightness), 0);
}

function limitChroma(scale, i, chroma) {
  if (chroma < 0) {
    console.warn(
      `Calculated LCh chroma \`${chroma}\` for \`${scale}${i}\` is out of range, and has been set to \`0\`.`
    );
  } else if (chroma > maximumChroma) {
    console.warn(
      `Calculated LCh chroma \`${chroma}\` for \`${scale}${i}\` is out of range, and has been set to \`${maximumChroma}\`.`
    );
  }

  return Math.max(Math.min(chroma, maximumChroma), 0);
}

function generateColorScales(configuration) {
  let scales = {};

  for (const scale of Object.keys(configuration.colors).filter(
    k => k !== "_all"
  )) {
    scales[scale] = generateColorScale(
      scale,
      configuration.colors[scale],
      configuration.colors["_all"]
    );
  }

  return scales;
}

function trackColorsCount(isTracking) {
  isTrackingColorsCount = isTracking;
}

function increaseColorCount(scale, shade) {
  const el = colorsCount.find(c => c.color === `${scale}${shade}`);

  if (!el) {
    colorsCount.push({ scale, color: `${scale}${shade}`, count: 1 });
  } else {
    el.count = el.count + 1;
  }
}

function getColorsCountByScale(filterFn = identity) {
  return groupBy(
    colorsCount
      .sort((a, b) => a.color.localeCompare(b.color, "en", { numeric: true }))
      .filter(filterFn),
    "scale"
  );
}

function alpha(colorHex, alpha) {
  return (
    colorHex +
    Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0")
  );
}

function rgbString(color) {
  const r = Math.round(Math.max(color.r, 0) * 255);
  const g = Math.round(Math.max(color.g, 0) * 255);
  const b = Math.round(Math.max(color.b, 0) * 255);

  return `${r}, ${g}, ${b}`;
}

function isHexColor(colorHex) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorHex);
}

function generateColorConstantReplacements(colors, quotedKeys = true) {
  let replacements = [];

  for (const key of Object.keys(colors)) {
    for (let i = 0; i < colors[key].length; i++) {
      if (quotedKeys) {
        replacements.push([`"${key}${i}"`, colors[key][i]]);
      } else {
        replacements.push([`${key}${i}`, colors[key][i]]);
      }
    }
  }

  return replacements;
}

function generateColorConstants(colors) {
  let constants = {};

  for (const key of Object.keys(colors)) {
    for (let i = 0; i < colors[key].length; i++) {
      constants[`${key}${i}`] = colors[key][i];
    }
  }

  return constants;
}

function getTerminalColorFunction(configuration, colorConstants) {
  return terminalColor => {
    const dark = configuration.variant !== "light";

    const tokenColor = configuration.customizations.terminal[terminalColor];

    return translateColorConstant(
      colorConstants,
      dark ? tokenColor.dark : tokenColor.light
    );
  };
}

function getTokenColorFunction(configuration, colorConstants) {
  return tokenName => {
    const dark = configuration.variant !== "light";

    const tokenColor = configuration.customizations.tokens[tokenName];

    return translateColorConstant(
      colorConstants,
      dark ? tokenColor.dark : tokenColor.light
    );
  };
}

function getVariantShadeFunction(configuration) {
  return shade => {
    const dark = configuration.variant !== "light";

    return dark ? shade : 40 - shade;
  };
}

function splitColorConstant(colorConstant) {
  if (Number.isNaN(parseInt(colorConstant[colorConstant.length - 2], 10))) {
    return [
      colorConstant.substr(0, colorConstant.length - 1),
      colorConstant[colorConstant.length - 1]
    ];
  } else {
    return [
      colorConstant.substr(0, colorConstant.length - 2),
      colorConstant.substr(colorConstant.length - 2)
    ];
  }
}

function translateColorConstant(colorConstants, colorConstant) {
  if (colorConstant.startsWith("#")) {
    return colorConstant;
  } else {
    if (colorConstant.includes("_")) {
      const [colorConstant_, alpha] = colorConstant.split("_");

      if (isTrackingColorsCount) {
        const [scale, shade] = splitColorConstant(colorConstant_);

        increaseColorCount(scale, shade);
      }

      return colorConstants[colorConstant_] + alpha;
    } else {
      if (isTrackingColorsCount) {
        const [scale, shade] = splitColorConstant(colorConstant);

        increaseColorCount(scale, shade);
      }

      return colorConstants[colorConstant];
    }
  }
}

function getColorScaleName(constantName) {
  switch (constantName) {
    case "blueLessChroma":
      return "Blue (less chroma)";
    case "blueMoreChroma":
      return "Blue (more chroma)";
    default:
      return changeCase.titleCase(constantName);
  }
}

function applyColorConstantReplacements(
  color,
  colorReplacements,
  colorReplacementKeys
) {
  if (isHexColor(color)) {
    return color;
  } else if (colorReplacementKeys.includes(color) !== -1) {
    return colorReplacements[colorReplacementKeys.indexOf(color)];
  } else {
    throw new Error(`Dainty color constant ${color} not found.`);
  }
}

function checkColorScaleRange(index) {
  if (!(Number.isInteger(index) && index >= 0 && index <= 39)) {
    throw new Error(
      `\`${index}\` is not a valid index for a Dainty color scale. Index must be an integer ≥ 0 and ≤ 39.`
    );
  }

  return index;
}

module.exports = {
  alpha,
  applyColorConstantReplacements,
  checkColorScaleRange,
  generateColorConstantReplacements,
  generateColorConstants,
  getVariantShadeFunction,
  getTerminalColorFunction,
  getTokenColorFunction,
  translateColorConstant,
  generateColorScales,
  getColorsCountByScale,
  getColorScaleName,
  isHexColor,
  rgbString,
  trackColorsCount
};
