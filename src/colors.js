const culori = require("culori");
const easing = require("bezier-easing");
const changeCase = require("change-case");
const { valueOrDefault, sum } = require("./utils-universal");

const maximumLightness = 100;
const maximumChroma = 131.207;
const defaultHue = 270;

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

function limit(lchColor, scale, shade) {
  if (lchColor.l < 0) {
    console.warn(
      `Calculated LCh lightness \`${
        lchColor.l
      }\` for \`${scale}${shade}\` is out of range, and will be set to \`0\`.`
    );
  } else if (lchColor.l > maximumLightness) {
    console.warn(
      `Calculated LCh lightness \`${
        lchColor.l
      }\` for \`${scale}${shade}\` is out of range, and will be set to \`${maximumLightness}\`.`
    );
  }

  if (lchColor.c < 0) {
    console.warn(
      `Calculated LCh chroma \`${
        lchColor.c
      }\` for \`${scale}${shade}\` is out of range, and will be set to \`0\`.`
    );
  } else if (lchColor.c > maximumChroma) {
    console.warn(
      `Calculated LCh chroma \`${
        lchColor.c
      }\` for \`${scale}${shade}\` is out of range, and will be set to \`${maximumChroma}\`.`
    );
  }

  return {
    ...lchColor,
    l: Math.max(Math.min(lchColor.l, maximumLightness), 0),
    c: Math.max(Math.min(lchColor.c, maximumChroma), 0)
  };
}

function getLightness(start, color, all, userAdjustments = {}, adjustments) {
  const lightness = [
    color.lightness,
    all.lightness,
    userAdjustments.lightness,
    adjustments.lightness
  ];

  if (start) {
    return (
      (maximumLightness / 100) *
      lightness
        .concat([
          color.lightnessStart,
          all.lightnessStart,
          userAdjustments.lightnessStart,
          adjustments.lightnessStart
        ])
        .map(valueOrDefault)
        .reduce(sum)
    );
  } else {
    return (
      100 +
      (maximumLightness / 100) *
        lightness
          .concat([
            color.lightnessEnd,
            all.lightnessEnd,
            userAdjustments.lightnessEnd,
            adjustments.lightnessEnd
          ])
          .map(valueOrDefault)
          .reduce(sum)
    );
  }
}

function getChroma(start, color, all, userAdjustments = {}, adjustments) {
  const chroma = [
    color.chroma,
    all.chroma,
    userAdjustments.chroma,
    adjustments.chroma
  ];

  if (start) {
    return (
      (maximumChroma / 100) *
      chroma
        .concat([
          color.chromaStart,
          all.chromaStart,
          userAdjustments.chromaStart,
          adjustments.chromaStart
        ])
        .map(valueOrDefault)
        .reduce(sum)
    );
  } else {
    return (
      (maximumChroma / 100) *
      chroma
        .concat([
          color.chromaEnd,
          all.chromaEnd,
          userAdjustments.chromaEnd,
          adjustments.chromaEnd
        ])
        .map(valueOrDefault)
        .reduce(sum)
    );
  }
}

function getColor(start, color, all, userAdjustments, adjustments) {
  return {
    mode: "lch",
    l: getLightness(start, color, all, userAdjustments, adjustments),
    c: getChroma(start, color, all, userAdjustments, adjustments),
    h: color.hue
  };
}

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

function getExactColor(color, all, userAdjustments = {}, adjustments) {
  const lightness = [
    color.lightnessExact,
    all.lightness,
    userAdjustments.lightness,
    adjustments.lightness
  ]
    .map(valueOrDefault)
    .reduce(sum);

  const chroma = [
    color.chroma,
    all.chroma,
    userAdjustments.chroma,
    adjustments.chroma
  ]
    .map(valueOrDefault)
    .reduce(sum);

  return {
    mode: "lch",
    l: (maximumLightness / 100) * lightness,
    c: (maximumChroma / 100) * chroma,
    h: color.hue
  };
}

function getColorFunction({ type, colors }) {
  return (scale, shade, alpha = 1, adjustments = {}) => {
    const color = getInternalColor(scale, colors[scale]);

    if (shade === "exact") {
      return (
        culori.formatter("hex")(
          limit(
            getExactColor(color, colors._all, colors._adjustments, adjustments)
          )
        ) +
        Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0")
      );
    }

    const start = getColor(
      true,
      color,
      colors._all,
      colors._adjustments,
      adjustments
    );
    const end = getColor(
      false,
      color,
      colors._all,
      colors._adjustments,
      adjustments
    );

    const interpolated = culori.interpolate([start, end], "lch");

    const bezier =
      type === "dark"
        ? easing(0.25 + 1 / 16, 0.25 - 1 / 16, 0.75, 0.75)
        : easing(0.25, 0.25, 0.75 - 1 / 16, 0.75 + 1 / 16);

    return (
      culori.formatter("hex")(
        limit(interpolated(bezier((1 / 16) * shade)), scale, shade)
      ) +
      Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")
    );
  };
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

function getPropertyFunction(configuration, getColor) {
  return descriptor => {
    if (descriptor.startsWith("accent")) {
      return getColor(
        ...configuration.customizations.accents[descriptor[6]].split("-")
      );
    } else if (descriptor.startsWith("token.")) {
      return getColor(
        ...configuration.customizations.tokens[
          filterTokens(configuration, descriptor.substr(6))
        ].split("-")
      );
    } else if (descriptor.includes(".")) {
      const descriptor_ = descriptor.split(".");

      return getColor(
        ...configuration.customizations[descriptor_[0]][descriptor_[1]].split(
          "-"
        )
      );
    } else {
      return getColor(...configuration.customizations[descriptor].split("-"));
    }
  };
}

function getTypeShadeFunction(configuration) {
  return (shade, lightShade = null) => {
    const dark = configuration.type === "dark";

    return dark ? shade : lightShade ? lightShade : 16 - shade;
  };
}

function getTypeValueFunction(configuration) {
  return (darkValue, lightValue) => {
    const dark = configuration.type === "dark";

    return dark ? darkValue : lightValue;
  };
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

function adjustChroma(color, amount) {
  const lchColor = culori.lch(color);

  return culori.formatter("hex")({
    ...lchColor,
    c: lchColor.c + (amount / 100) * maximumChroma
  });
}

module.exports = {
  getColorFunction,
  getTypeShadeFunction,
  getColorScaleName,
  getTypeValueFunction,
  getPropertyFunction,
  adjustChroma
};
