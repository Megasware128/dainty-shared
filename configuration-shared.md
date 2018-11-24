# Configuration across applications

Dainty has a unique configuration schema per application. However, the properties `"variant"` and `"colors"` are shared among them. In addition, Dainty has support for presets among all applications. That is also described in this document.

## `configuration.json`

### `"variant"`

Set `"variant"` to `"light"` to enable the light theme. _The light theme is currently not as complete as the dark theme._

### `"colors"."adjustments"`

| Property        | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `"lightness"`   | Adjust lightness to make blue-grays either darker or lighter |
| `"chroma"`      | Adjust chroma to make colors either more or less saturated   |
| `"chromaStart"` | Adjust start of blue grays scale chroma                      |
| `"chromaEnd"`   | Adjust start of blue grays scale chroma                      |

There are currently no minimum or maximum values set.

### `"colors"."overrides"`

| Property           | Description                                  |
| ------------------ | -------------------------------------------- |
| `"blue"`           | Base color as hex for blue scale             |
| `"blueGray"`       | Base color as hex for blue-gray scale        |
| `"blueLessChroma"` | Base color as hex for blue less chroma scale |
| `"blueMoreChroma"` | Base color as hex for blue more chroma scale |
| `"cyan"`           | Base color as hex for cyan scale             |
| `"green"`          | Base color as hex for green scale            |
| `"orange"`         | Base color as hex for orange scale           |
| `"purple"`         | Base color as hex for purple scale           |

With a provided base color a scale of 40 shades is built. The color will be converted to LCh and its hue and chroma (saturation) are used while the lightness is calculated. For the blue-grays scale the exact lightness is used for the darkest shade. For the remaining an algorithm decides what lightness to use.

## Presets

Presets are configuration files that can be used in addition to `configuration.json`. They are intended for turning Dainty into another color theme. Presets, if present, are located in the `presets` directory and can be activated by adding `-p <name>` or `--preset <name>` to `build`:

    npm run build -- -p dainty-remix

If a property is set in both `configuration.json` and the preset configuration, then the one in `configuration.json` is used.
