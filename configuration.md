# Configuration

Dainty has a unique configuration schema defined for each application. Dainty for each application supports configuration presets. Properties such as `colors"` and`"customization"` are shared among all schemas.

## Presets

Presets are configuration files that can be used in addition to `configuration.jsonc`. They are intended for turning Dainty into another color theme. Presets are located in the `presets` directory of the shared repository and can be activated by adding `-p <preset>` or `--preset <preset>` to `yarn build`:

    yarn build -p dainty-light

If a property is set in both `configuration.jsonc` and the preset configuration, then the one in `configuration.jsonc` is used.

## User configuration

### `preset` (`string`)

Preset to use if no preset is specified. Defaults to `dainty-dark`.

### `colors` (`object`)

The `colors` object defines all colors, and processing of colors.

#### `_adjustments` (`object`)

| Property         | Type     | Description                                           |
| ---------------- | -------- | ----------------------------------------------------- |
| `lightness`      | `number` | Lightness to be added or subtracted                   |
| `lightnessStart` | `number` | Lightness to be added or subtracted at start of scale |
| `lightnessEnd`   | `number` | Lightness to be added or subtracted at end of scale   |
| `chroma`         | `number` | Chroma to be added or subtracted                      |
| `chromaStart`    | `number` | Chroma to be added or subtracted at start of scale    |
| `chromaEnd`      | `number` | Chroma to be added or subtracted at end of scale      |

## Preset configuration

The following properties are intended to be set only by presets.

### `type` (`string`)

Type of preset. Can either be `dark` or `light`.

### `name` (`string`)

Name of the preset.

### `description` (`string`)

A description of the preset.

### `colors` (`object`)

The `colors` object defines all colors, and processing of colors.

#### `_all` (`object`)

| Property         | Type     | Description                                           |
| ---------------- | -------- | ----------------------------------------------------- |
| `lightness`      | `number` | Lightness to be added or subtracted                   |
| `lightnessStart` | `number` | Lightness to be added or subtracted at start of scale |
| `lightnessEnd`   | `number` | Lightness to be added or subtracted at end of scale   |
| `chroma`         | `number` | Chroma to be added or subtracted                      |
| `chromaStart`    | `number` | Chroma to be added or subtracted at start of scale    |
| `chromaEnd`      | `number` | Chroma to be added or subtracted at end of scale      |

#### `name-of-color` (`object`)

| Property         | Type     | Description                                           |
| ---------------- | -------- | ----------------------------------------------------- |
| `hex`            | `number` | Color as hex                                          |
| `lightness`      | `number` | Lightness to be added or subtracted                   |
| `lightnessStart` | `number` | Lightness to be added or subtracted at start of scale |
| `lightnessEnd`   | `number` | Lightness to be added or subtracted at end of scale   |
| `chroma`         | `number` | Chroma of color                                       |
| `chromaStart`    | `number` | Chroma to be added or subtracted at start of scale    |
| `chromaEnd`      | `number` | Chroma to be added or subtracted at end of scale      |
| `hue`            | `number` | Hue as CIELAB hue in range 0–360                      |

With a provided base color a scale of 41 shades is built. When color is expressed as hex as opposed to hue and chroma, the color will be converted to LCh and its hue and chroma are used while the lightness is calculated. See `dainty-dark.jsonc` for all available colors.

### `customizations` (`object`)

This object defines usages of colors.

#### `terminal` (`object`)

##### `name-of-property` (`object`)

See `dainty-dark.jsonc` for all available properties. Value can be either a Dainty color constant or a hex color value.

#### `tokens` (object)

##### `name-of-token` (`object`)

See `dainty-dark.jsonc` for all available token names. Value can be either a Dainty color constant or a hex color value.
