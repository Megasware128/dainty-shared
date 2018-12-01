# Shared configuration

Dainty has a unique configuration schema defined for each application. Properties `"type"` and `"colors"` are shared among all schemas. In addition, Dainty for every application supports configuration presets.

## `configuration.jsonc`

### `"type"`

Set `"type"` to `"light"` to enable the light theme. _The light theme is currently not as complete as the dark theme._

### `"colors"`

### `"_all"`

| Property           | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `"lightness"`      | Lightness to be added or subtracted                   |
| `"lightnessStart"` | Lightness to be added or subtracted at start of scale |
| `"lightnessEnd"`   | Lightness to be added or subtracted at end of scale   |
| `"chroma"`         | Chroma to be added or subtracted                      |
| `"chromaStart"`    | Chroma to be added or subtracted at start of scale    |
| `"chromaEnd"`      | Chroma to be added or subtracted at end of scale      |

### `"name-of-color"`

| Property           | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `"hex"`            | Color as hex                                          |
| `"lightness"`      | Lightness to be added or subtracted                   |
| `"lightnessStart"` | Lightness to be added or subtracted at start of scale |
| `"lightnessEnd"`   | Lightness to be added or subtracted at end of scale   |
| `"chroma"`         | Chroma of color                                       |
| `"chromaStart"`    | Chroma to be added or subtracted at start of scale    |
| `"chromaEnd"`      | Chroma to be added or subtracted at end of scale      |
| `"hue"`            | Hue as CIELAB hue in range 0–360                      |

With a provided base color a scale of 41 shades is built. When color is expressed as hex as opposed to hue and chroma, the color will be converted to LCh and its hue and chroma are used while the lightness is calculated.

## Presets

Presets are configuration files that can be used in addition to `configuration.jsonc`. They are intended for turning Dainty into another color theme. Presets are located in the `presets` directory of the shared repository and can be activated by adding `-p <preset>` or `--preset <preset>` to `yarn build`:

    yarn build -p dainty-remix

If a property is set in both `configuration.jsonc` and the preset configuration, then the one in `configuration.jsonc` is used.
