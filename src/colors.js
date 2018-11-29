const culori = require("culori");
const changeCase = require("change-case");
const { groupBy, identity } = require("./utils");

let colorsCount = [];
let isTrackingColorsCount = false;

function generateScale(scale, override, adjustments) {
  const maximumLightness = 100;
  const lightnessMultiplier = 2 + 5 / 16;
  let lightnessAdjustment = 0;

  const maximumChroma = 131.207;
  let chromaDivisor;
  let chromaAdjustment = 0;
  let chromaStartAdjustment = 0;
  let chromaEndAdjustment = 0;

  let hue;

  const lchOverride = override ? culori.lch(override) : null;

  if (!lchOverride) {
    chromaAdjustment = -1;
  }

  switch (scale) {
    case "red":
      hue = 22.5;
      chromaDivisor = 2.5;
      break;
    case "orange":
      hue = 45;
      chromaDivisor = 6;
      break;
    case "yellow":
      hue = 90;
      chromaDivisor = 4.25;
      break;
    case "green":
      hue = 180;
      chromaDivisor = 4.5;
      break;
    case "cyan":
      hue = 225 + 90 / 32;
      chromaDivisor = 4;
      break;
    case "neutral":
      hue = 270 - 90 / 16;
      chromaDivisor = 12.5;

      if (!lchOverride) {
        lightnessAdjustment = 2;
        chromaEndAdjustment = -10;
      }
      break;
    case "blue":
      hue = 270 - 90 / 16;
      chromaDivisor = 3.5;
      break;
    case "blueLessChroma":
      hue = 270 - 90 / 16;
      chromaDivisor = 5;
      break;
    case "blueMoreChroma":
      hue = 270 + 90 / 16;
      chromaDivisor = 2;
      break;
    case "purple":
      hue = 315;
      chromaDivisor = 3;
      break;
  }

  if (scale === "neutral") {
    chromaAdjustment += adjustments.chroma ? adjustments.chroma / 3 : 0;
    lightnessAdjustment += adjustments.lightness ? adjustments.lightness : 0;
    chromaStartAdjustment += adjustments.chromaStart
      ? adjustments.chromaStart
      : 0;
    chromaEndAdjustment += adjustments.chromaEnd ? adjustments.chromaEnd : 0;
  } else {
    chromaAdjustment += adjustments.chroma ? adjustments.chroma * 2 : 0;
  }

  let shades = [];

  for (let i = 0; i < 40; i++) {
    shades.push({
      mode: "lch",
      h: lchOverride ? lchOverride.h : hue,
      l:
        (lchOverride && scale === "neutral"
          ? lchOverride.l + ((maximumLightness - lchOverride.l) / 39) * i
          : maximumLightness - lightnessMultiplier * (39 - i)) +
        (lightnessAdjustment / 39) * (39 - i),
      c:
        (lchOverride ? lchOverride.c : maximumChroma / chromaDivisor) +
        (scale === "neutral" ? chromaAdjustment / 3 : chromaAdjustment * 3) +
        (chromaStartAdjustment / 39) * (39 - i) +
        (chromaEndAdjustment / 39) * i
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

function generateColorScales(configuration) {
  const overrides = configuration.colors.overrides
    ? configuration.colors.overrides
    : {};

  function handleVariant(shades, isNeutral) {
    if (configuration.variant === "light" && isNeutral) {
      return shades.reverse();
    } else {
      return shades;
    }
  }

  const colors = {
    red: handleVariant(
      generateScale("red", overrides.red, configuration.colors.adjustments)
    ),
    orange: handleVariant(
      generateScale(
        "orange",
        overrides.orange,
        configuration.colors.adjustments
      )
    ),
    yellow: handleVariant(
      generateScale(
        "yellow",
        overrides.yellow,
        configuration.colors.adjustments
      )
    ),
    green: handleVariant(
      generateScale("green", overrides.green, configuration.colors.adjustments)
    ),
    cyan: handleVariant(
      generateScale("cyan", overrides.cyan, configuration.colors.adjustments)
    ),
    neutral: handleVariant(
      generateScale(
        "neutral",
        overrides.neutral,
        configuration.colors.adjustments
      ),
      true
    ),
    blue: handleVariant(
      generateScale("blue", overrides.blue, configuration.colors.adjustments)
    ),
    blueLessChroma: handleVariant(
      generateScale(
        "blueLessChroma",
        overrides.blueLessChroma,
        configuration.colors.adjustments
      )
    ),
    blueMoreChroma: handleVariant(
      generateScale(
        "blueMoreChroma",
        overrides.blueMoreChroma,
        configuration.colors.adjustments
      )
    ),
    purple: handleVariant(
      generateScale(
        "purple",
        overrides.purple,
        configuration.colors.adjustments
      )
    )
  };

  return colors;
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
