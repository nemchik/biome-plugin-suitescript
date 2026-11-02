# Infer script type from entry points; validate comment tags in a bundled CLI

Biome plugins (GritQL and JS, as of 2.6.4) cannot read comments or files, so `@NApiVersion` and `@NScriptType` are invisible to rules. We infer the script type from the entry points a module returns (so the plugin dictates no folder or naming layout), and ship a small CLI that reads the tags to require `@NApiVersion 2.1`. Rejected: per-script-type rules scoped by `includes` (forces folder-per-type layouts), and dropping the 2.1 requirement. Retire the CLI if Biome adds comment access to plugins.
