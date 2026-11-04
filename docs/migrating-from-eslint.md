# Migrating from the ESLint plugins

This package is ported from [acdvs/eslint-plugin-suitescript](https://github.com/acdvs/eslint-plugin-suitescript), [btonasse/eslint-plugin-suitescript](https://github.com/btonasse/eslint-plugin-suitescript) and the rules of [acdvs/eslint-plugin-amd](https://github.com/acdvs/eslint-plugin-amd) that apply to SuiteScript. If you lint with one of them today, this page maps each rule to its replacement and lists what changed. The package assumes SuiteScript 2.1 ([ADR 0004](adr/0004-assume-suitescript-2-1-only.md)), so 1.0, 2.0 and 2.x scripts are out of scope.

## Config

ESLint (`eslint.config.js`):

```js
import suitescript from "eslint-plugin-suitescript";

export default [
    ...suitescript.configs.recommended,
    ...suitescript.configs.suitescript2, // the `log` and `util` globals
];
```

Biome (`biome.json`):

```jsonc
{
    "extends": ["biome-plugin-suitescript/configs/recommended"]
}
```

`configs/recommended` enables the recommended plugin rules, Biome's own recommended rules and the native Biome rules that Oracle's sources ask for, and it declares the SuiteScript globals (`define`, `require`, `log`, `util`). `configs/minimal` and `configs/all` are the smaller and larger presets. See the README for what each enables. Install with `npm i -D @biomejs/biome biome-plugin-suitescript`.

## Rule mapping

Every ESLint rule that a rule here was ported from. Rules here are broader than the ESLint rules they came from in places; each page names its sources.

<!-- BEGIN GENERATED TABLE -->

| ESLint plugin | ESLint rule | Rule here |
| --- | --- | --- |
| eslint-plugin-amd | `no-dynamic-require` | [`noDynamicRequire`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noDynamicRequire.md) |
| eslint-plugin-amd | `no-extra-deps` | [`noExtraDeps`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noExtraDeps.md) |
| eslint-plugin-amd | `no-extra-params` | [`noExtraParams`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noExtraParams.md) |
| eslint-plugin-amd | `no-invalid-define` | [`noInvalidDefine`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noInvalidDefine.md) |
| eslint-plugin-amd | `no-module-extensions` | [`noModuleExtensions`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noModuleExtensions.md) |
| eslint-plugin-amd | `no-name` | [`noAmdName`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noAmdName.md) |
| eslint-plugin-suitescript (acdvs) | `entry-points` | [`entryPoints`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/entryPoints.md) |
| eslint-plugin-suitescript (acdvs) | `log-args` | [`logRequireDetails`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/logRequireDetails.md), [`logRequireTitle`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/logRequireTitle.md) |
| eslint-plugin-suitescript (acdvs) | `module-vars` | [`moduleVars`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/moduleVars.md) |
| eslint-plugin-suitescript (acdvs) | `no-invalid-modules` | [`noInvalidModules`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noInvalidModules.md) |
| eslint-plugin-suitescript (acdvs) | `no-log-module` | [`noLogModule`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noLogModule.md) |
| eslint-plugin-suitescript (btonasse) | `entry-points` | [`entryPoints`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/entryPoints.md) |
| eslint-plugin-suitescript (btonasse) | `log-args` | [`logRequireDetails`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/logRequireDetails.md), [`logRequireTitle`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/logRequireTitle.md) |
| eslint-plugin-suitescript (btonasse) | `module-vars` | [`moduleVars`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/moduleVars.md) |
| eslint-plugin-suitescript (btonasse) | `no-amd-name` | [`noAmdName`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noAmdName.md) |
| eslint-plugin-suitescript (btonasse) | `no-extra-modules` | [`noExtraDeps`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noExtraDeps.md), [`noExtraParams`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noExtraParams.md) |
| eslint-plugin-suitescript (btonasse) | `no-invalid-modules` | [`noInvalidModules`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noInvalidModules.md) |
| eslint-plugin-suitescript (btonasse) | `no-log-module` | [`noLogModule`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noLogModule.md) |
| eslint-plugin-suitescript (btonasse) | `no-module-extensions` | [`noModuleExtensions`](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/noModuleExtensions.md) |

<!-- END GENERATED TABLE -->

The table above is generated from `scripts/rule-sources.ts` by `npm run docs`; change that file, not the table.

## Rules with no direct replacement

| ESLint rule                                              | What replaces it                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eslint-plugin-suitescript` `api-version` (both plugins) | The tag checker, `npx biome-plugin-suitescript check`. Biome plugins cannot read comments, so `@NApiVersion` is checked by a small CLI that must run beside `biome check` ([ADR 0001](adr/0001-infer-script-type-and-check-tags-in-cli.md)). It reports any value other than `2.1`. |
| `eslint-plugin-suitescript` `script-type` (both plugins) | The same tag checker, which validates `@NScriptType`. The Biome rules infer the script type from the entry points a module returns instead of reading the tag.                                                                                                                      |
| `eslint-plugin-amd` `define-indicator`, `sorted-deps`    | Not ported. Both are generic JavaScript style rules, and a generic rule is added only with a SuiteScript-specific justification (see [docs/rule-priority.md](rule-priority.md)).                                                                                                    |

## What changed

- **Options became separate rules.** Biome plugins take no runtime options ([ADR 0002](adr/0002-options-are-separate-rules.md)). The `log-args` options `requireTitle` and `requireDetails` are the rules `logRequireTitle` and `logRequireDetails`, enabled independently.
- **Custom module identifiers.** The `module-vars` option that adds your own identifiers is replaced by a generated rule: `npx biome-plugin-suitescript generate module-vars --set N/record=nRecord --out plugins/module-vars.js`, used instead of `moduleVars`. The README explains it.
- **The tag checker needs its own run.** It reads the files listed in `biome-plugin-suitescript.json` (or glob arguments) and refuses to run without a list ([ADR 0003](adr/0003-cli-checks-only-explicitly-listed-script-sources.md)). Add it to the same CI step or npm script as `biome check`.
- **Severities and presets are set per rule.** Rules that fail at runtime or on upload are errors and are in `recommended`; conventions are warnings; rules that guess are in no preset ([ADR 0005](adr/0005-guessing-rules-are-in-no-preset.md)). Turn individual rules off or change their severity in `biome.json` the usual Biome way.
- **`N/log` is a global, with two opposite styles.** `noLogModule` and `requireLogModule` are separate rules because Oracle's sources disagree ([ADR 0006](adr/0006-log-is-a-global-with-two-opposite-styles.md)). Enable the one that matches your code.
- **More rules.** Most rules here have no ESLint ancestor. They come from Oracle's agent skills, the type definitions and Oracle's documentation; see the [rules table](../README.md#rules).
