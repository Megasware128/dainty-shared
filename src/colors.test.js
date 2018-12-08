const { getInternalColor } = require("./colors");
const culori = require("culori");

test("`getInternalColor` given hex for scale not `neutral`", () => {
  const internalColor = getInternalColor("blue", { hex: "#0000ff" });

  expect(internalColor.lightnessStart).toBeNull();
  expect(internalColor.lightnessExact).toBeGreaterThan(0);
  expect(internalColor.chroma).toBeGreaterThan(0);
  expect(internalColor.hue).toBeGreaterThan(0);
});

test("`getInternalColor` given hex for scale `neutral`", () => {
  const internalColor = getInternalColor("neutral", { hex: "#001122" });

  expect(internalColor.lightnessStart).toBeGreaterThan(0);
  expect(internalColor.lightnessExact).toBeGreaterThan(0);
  expect(internalColor.chroma).toBeGreaterThan(0);
  expect(internalColor.hue).toBeGreaterThan(0);
});

test("`culori.lch` given grayscale color as hex", () => {
  const lchColor = culori.lch("#222222");

  expect(lchColor.hue).toBeUndefined();
});

test("`getInternalColor` given grayscale hex", () => {
  const internalColor = getInternalColor("neutral", { hex: "#222222" });
  const redHue = 0;

  expect(internalColor.hue).toBeDefined();
  expect(internalColor.hue).toBeGreaterThan(redHue);
});
