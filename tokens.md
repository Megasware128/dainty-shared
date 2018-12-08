# Tokens

## Resources

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar
- https://github.com/conorhastings/react-syntax-highlighter/blob/master/src/languages/prism/clike.js
- https://github.com/highlightjs/highlight.js/blob/master/src/languages/javascript.js

| Token             | Examples                                          | Implemented |
| ----------------- | ------------------------------------------------- | ----------- |
| `attributeName`   | `src`, `href`                                     | ✓           |
| `comment`         | `//`, `/\*\*/`                                    | ✓           |
| `constant`        | -                                                 | -           |
| `function`        | `getColorsCountByScale`, `generateColorConstants` | ✓           |
| `keyword`         | `if`, `switch`, `default`                         | ✓           |
| `literal`         | `null`, `true`, `false`, `NaN`                    | ✗           |
| `number`          | `42`, `0777`                                      | ✓           |
| `operator`        | "neutral30"                                       | -           |
| `otherType`       | `IServiceCollection`, `SameSiteMode`              | ✓           |
| `propertyName`    | _JSON properties and object keys_                 | ✓           |
| `punctuation`     | `{`, `[`, `;`, `(`, `)`                           | ✓           |
| `regex`           | `\d`, `\w`                                        | ✓           |
| `storageType`     | `const`, `let`, `function`                        | ✓           |
| `string`          | `42`, `0777`                                      | ✓           |
| `supportFunction` | `require`, `stringify`, `getTime`                 | ✓           |
| `supportType`     | `Math`, `JSON`, `console`, `Promise`              | ✗           |
| `type`            | `MyWebApplication.Models`, `HomeController`       | ✓           |
| `url`             | `https://dainty.site`                             | -           |
| `variable`        | `result`                                          | -           |
