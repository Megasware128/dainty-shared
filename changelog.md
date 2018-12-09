# Changelog

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
