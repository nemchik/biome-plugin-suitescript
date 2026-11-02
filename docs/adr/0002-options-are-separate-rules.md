# Express rule options as separate rules, presets, and generated files

Biome plugins take no runtime options. Where ESLint had an option (for example `log-args` `requireTitle`/`requireDetails`) we ship separate rules, and for open-ended values (custom module identifiers) a CLI generator, rather than generating every option combination.
