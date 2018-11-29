# Shared configuration

Dainty has a unique configuration schema defined for each application. Properties `"variant"` and `"colors"` are shared among all schemas. In addition, Dainty for every application supports configuration presets.

## `configuration.json`

### `"variant"`

Set `"variant"` to `"light"` to enable the light theme. _The light theme is currently not as complete as the dark theme._

### `"colors"."adjustments"`

| Property        | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `"lightness"`   | Adjust lightness to make neutrals either darker or lighter |
| `"chroma"`      | Adjust chroma to make colors either more or less saturated |
| `"chromaStart"` | Adjust start of blue grays scale chroma                    |
| `"chromaEnd"`   | Adjust start of blue grays scale chroma                    |

There are currently no minimum or maximum values set.

### `"colors"."overrides"`

| Property           | Description                                  |
| ------------------ | -------------------------------------------- |
| `"blue"`           | Base color as hex for blue scale             |
| `"neutral"`        | Base color as hex for neutral scale          |
| `"blueLessChroma"` | Base color as hex for blue less chroma scale |
| `"blueMoreChroma"` | Base color as hex for blue more chroma scale |
| `"cyan"`           | Base color as hex for cyan scale             |
| `"green"`          | Base color as hex for green scale            |
| `"orange"`         | Base color as hex for orange scale           |
| `"purple"`         | Base color as hex for purple scale           |

With a provided base color a scale of 40 shades is built. The color will be converted to LCh and its hue and chroma (saturation) are used while the lightness is calculated. For the neutral scale, the lightness of the provided color is used for the darkest shade.

## Presets

Presets are configuration files that can be used in addition to `configuration.json`. They are intended for turning Dainty into another color theme. Presets are located in the `presets` directory for each application and can be activated by adding `-p <preset>` or `--preset <preset>` to `yarn build`:

    yarn build -p dainty-remix

If a property is set in both `configuration.json` and the preset configuration, then the one in `configuration.json` is used.
