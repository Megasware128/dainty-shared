const culori = require("culori");
const changeCase = require("change-case");
const { groupBy, identity, valueOrDefault, sum } = require("./utils-universal");

const maximumLightness = 100;
const maximumChroma = 131.207;
const defaultHue = 264.375;

let colorsCount = [];
let isTrackingColorsCount = false;

function getInternalColor(scale, color) {
  if (color.hex) {
    const lchColor = culori.lch(color.hex);

    return {
      ...color,
      lightnessStart: scale === "neutral" ? lchColor.l : null,
      lightnessExact: lchColor.l,
      chroma: (lchColor.c / maximumChroma) * 100,
      hue: lchColor.h ? lchColor.h : defaultHue
    };
  } else {
    return color;
  }
}

function getLightness(i, color, all, adjustments = {}, exact = false) {
  const lightness = [color.lightness, all.lightness, adjustments.lightness]
    .map(valueOrDefault)
    .reduce(sum);

  const lightnessStart = [
    color.lightnessStart,
    all.lightnessStart,
    adjustments.lightnessStart
  ]
    .map(valueOrDefault)
    .reduce(sum);

  const lightnessEnd = [
    color.lightnessEnd,
    all.lightnessEnd,
    adjustments.lightnessEnd
  ]
    .map(valueOrDefault)
    .reduce(sum);

  if (exact) {
    return color.lightnessExact + lightness + lightnessStart + lightnessEnd;
  } else {
    return (
      maximumLightness -
      (maximumLightness / 40) * (40 - i) +
      lightness +
      (lightnessStart / 40) * (40 - i) +
      (lightnessEnd / 40) * i
    );
  }
}

function getChroma(i, color, all, adjustments = {}, exact = false) {
  const chroma = [color.chroma, all.chroma, adjustments.chroma]
    .map(valueOrDefault)
    .reduce(sum);

  const chromaStart = [
    color.chromaStart,
    all.chromaStart,
    adjustments.chromaStart
  ]
    .map(valueOrDefault)
    .reduce(sum);

  const chromaEnd = [color.chromaEnd, all.chromaEnd, adjustments.chromaEnd]
    .map(valueOrDefault)
    .reduce(sum);

  if (exact) {
    return (
      (maximumChroma / 100) * chroma +
      (maximumChroma / 100) * chromaStart +
      (maximumChroma / 100) * chromaEnd
    );
  } else {
    return (
      (maximumChroma / 100) * chroma +
      (maximumChroma / 100) * (chromaStart / 40) * (40 - i) +
      (maximumChroma / 100) * (chromaEnd / 40) * i
    );
  }
}

function generateColorScale(scale, color, all, adjustments) {
  const color_ = getInternalColor(scale, color);

  let shades = [];

  for (let i = 0; i <= 40; i++) {
    shades.push({
      mode: "lch",
      l: limitLightness(scale, i, getLightness(i, color_, all, adjustments)),
      c: limitChroma(scale, i, getChroma(i, color_, all, adjustments)),
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

  let exact;

  if (color_.hex) {
    exact = culori.formatter("hex")({
      mode: "lch",
      l: limitLightness(
        scale,
        "_exact",
        getLightness(null, color_, all, adjustments, true)
      ),
      c: limitChroma(
        scale,
        "_exact",
        getChroma(null, color_, all, adjustments, true)
      ),
      h: color_.hue
    });
  } else {
    exact = null;
  }

  return new Proxy(
    [...shades.map(culori.formatter("hex")), { exact }],
    handler
  );
}

function limitLightness(scale, i, lightness) {
  if (lightness < 0) {
    console.warn(
      `Calculated LCh lightness \`${lightness}\` for \`${scale}${i}\` is out of range. Will be set to \`0\`.`
    );
  } else if (lightness > maximumLightness) {
    console.warn(
      `Calculated LCh lightness \`${lightness}\` for \`${scale}${i}\` is out of range. Will be set to \`${maximumLightness}\`.`
    );
  }

  return Math.max(Math.min(lightness, maximumLightness), 0);
}

function limitChroma(scale, i, chroma) {
  if (chroma < 0) {
    console.warn(
      `Calculated LCh chroma \`${chroma}\` for \`${scale}${i}\` is out of range. Will be set to \`0\`.`
    );
  } else if (chroma > maximumChroma) {
    console.warn(
      `Calculated LCh chroma \`${chroma}\` for \`${scale}${i}\` is out of range. Will be set to \`${maximumChroma}\`.`
    );
  }

  return Math.max(Math.min(chroma, maximumChroma), 0);
}

function generateColorScales(configuration) {
  let scales = {};

  for (const scale of Object.keys(configuration.colors).filter(
    k => !(k === "_all" || k === "_adjustments")
  )) {
    scales[scale] = generateColorScale(
      scale,
      configuration.colors[scale],
      configuration.colors["_all"],
      configuration.colors["_adjustments"]
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
    for (let i = 0; i <= 40; i++) {
      constants[`${key}${i}`] = colors[key][i];
    }

    if (colors[key].find(c => c.exact)) {
      constants[`${key}_exact`] = colors[key].find(c => c.exact).exact;
    }
  }

  return constants;
}

function filterTokens({ customizations }, token) {
  const filter = customizations.tokensFilter;

  switch (filter) {
    case 0:
      break;
    case 1:
      if (["constant", "parameter", "variable"].includes(token)) {
        return "other";
      }
      break;
    case 2:
      if (
        [
          "constant",
          "parameter",
          "variable",
          "variableProperty",
          "property"
        ].includes(token)
      ) {
        return "other";
      }
      break;
    case 3:
      if (
        [
          "constant",
          "parameter",
          "variable",
          "variableProperty",
          "property",
          "supportFunction",
          "supportType"
        ].includes(token)
      ) {
        return "other";
      }
      break;
  }

  return token;
}

function getPropertyFunction(configuration, colorConstants) {
  return descriptor => {
    if (descriptor.startsWith("accent")) {
      return translateColorConstant(
        colorConstants,
        configuration.customizations.accents[descriptor[6]]
      );
    } else if (descriptor.startsWith("token.")) {
      return translateColorConstant(
        colorConstants,
        configuration.customizations.tokens[
          filterTokens(configuration, descriptor.substr(6))
        ]
      );
    } else if (descriptor.includes(".")) {
      const descriptor_ = descriptor.split(".");

      return translateColorConstant(
        colorConstants,
        configuration.customizations[descriptor_[0]][descriptor_[1]]
      );
    } else {
      return translateColorConstant(
        colorConstants,
        configuration.customizations[descriptor]
      );
    }
  };
}

function getTypeShadeFunction(configuration) {
  return (shade, lightShade = null) => {
    const dark = configuration.type !== "light";

    return dark ? shade : lightShade ? lightShade : 40 - shade;
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
  let exact = false;
  let colorConstant_ = colorConstant;

  if (colorConstant_.endsWith("_exact")) {
    exact = true;
    colorConstant_ = colorConstant_.slice(0, -6);
  }

  if (colorConstant_.includes("_")) {
    const [colorConstant__, alpha] = colorConstant_.split("_");

    if (isTrackingColorsCount) {
      const [scale, shade] = splitColorConstant(colorConstant__);

      increaseColorCount(scale, shade);
    }

    if (exact) {
      return colorConstants[colorConstant__ + "_exact"] + alpha;
    } else {
      return colorConstants[colorConstant__] + alpha;
    }
  } else {
    if (isTrackingColorsCount) {
      const [scale, shade] = splitColorConstant(colorConstant_);

      increaseColorCount(scale, shade);
    }

    if (exact) {
      return colorConstants[colorConstant_ + "_exact"];
    } else {
      return colorConstants[colorConstant_];
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
  getInternalColor,
  alpha,
  applyColorConstantReplacements,
  checkColorScaleRange,
  generateColorConstantReplacements,
  generateColorConstants,
  getTypeShadeFunction,
  getPropertyFunction,
  translateColorConstant,
  generateColorScales,
  getColorsCountByScale,
  getColorScaleName,
  isHexColor,
  rgbString,
  trackColorsCount
};
