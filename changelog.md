# Changelog

## `3.0.0`

- Use virtual scales of 16 shades with Bézier interpolation
- Change color constant format from `blue30_80` to `blue-12-0.5`
- Fix resolving WSL paths
- Import black, white, bright black and bright white terminal colors
- Merge terminal colors into Dainty colors for imported color themes
- Refine default presets
- Add presets
  - Debug preset
  - Base presets for each type that every preset derives from
  - Minimal
  - Dainty Dark Minimal
  - Additional imported presets
- Extend list of supported tokens

## `2.2.1`

- Enable filtering of tokens
- Import terminal colors

## `2.2.0`

- Enable import of VS Code themes
- Migrate configuration document to `dainty-site`
- Add support for setting `preset` in configuration
- Improve default themes
- Document CLI workflow

## `2.1.0`

- Rename preset “Dainty Dark Remix” to “Purple Haze”
- Add `colors._adjustments` for user adjustments, letting presets use `colors._all`
- Add Monokai preset
- Allow hue to be specified using floating point number
- Add metadata to presets

## `2.0.0`

- Extract light theme into `dainty-light`
- Add support for `dainty-site`
- Use shared configuration schema
- Use JSON with comments
- Move presets into shared
- Merge chroma adjustments into chrome definitions for Dainty themes
- Fix use of hex colors

## `1.0.0`

- Add more color adjustment options
- Limit lightness and chroma ranges, and log warning for colors that are out of range
- Define Dainty color theme as a preset
- Use Chalk when logging to console

## `0.1.0`

_Initial release_
