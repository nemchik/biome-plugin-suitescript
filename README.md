# biome-plugin-suitescript

[Biome](https://biomejs.dev) lint plugins and a tag checker for NetSuite **SuiteScript 2.1**, ported from
[acdvs/eslint-plugin-suitescript](https://github.com/acdvs/eslint-plugin-suitescript) and
[btonasse/eslint-plugin-suitescript](https://github.com/btonasse/eslint-plugin-suitescript).

Requires Biome **>= 2.6.4** (npm-distributed plugins use `biome-manifest.json`) and Node >= 22 for the CLI.
Rules work on both AMD `define()` and ES `import`/`export` source, in `.js` and `.ts`.

## Install

```sh
npm i -D @biomejs/biome biome-plugin-suitescript
```

## Use

```jsonc
// biome.json
{
    "extends": ["biome-plugin-suitescript/configs/suitescript2"], // globals: define, require, log, util
    "plugins": [
        "biome-plugin-suitescript/presets/recommended",
        "biome-plugin-suitescript/noLogModule" // add individual rules on top of a preset
    ]
}
```

Run the tag checker beside `biome check` (see [Tag checker](#tag-checker)):

```sh
npx biome-plugin-suitescript check
```

## Rules

Each rule has one fixed severity: `error` for things that fail at runtime or on upload, `warn` for conventions.
Biome plugins cannot be reconfigured per project, so you choose by enabling rules, scoping them, or generating one.

| Rule                           | Severity | Presets                                         | Description                                                                                                          | ESLint equivalent           |
| ------------------------------ | -------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `noAmdName` (fixable)          | error    | :green_circle::large_blue_circle:               | No module id as the first `define` argument                                                                          | `no-amd-name`               |
| `noExtraModules`               | error    | :white_circle::green_circle::large_blue_circle: | Dependency array and callback parameters must match in count                                                         | `no-extra-modules`          |
| `noInvalidModules`             | error    | :white_circle::green_circle::large_blue_circle: | Unknown `N/...` modules                                                                                              | `no-invalid-modules`        |
| `noModuleExtensions` (fixable) | error    | :green_circle::large_blue_circle:               | No `.js` in `define` dependency names                                                                                | `no-module-extensions`      |
| `moduleVars`                   | warn     | :green_circle::large_blue_circle:               | Conventional identifier per `N/` module (`N/record` → `record`)                                                      | `module-vars`               |
| `logRequireTitle`              | warn     | :green_circle::large_blue_circle:               | `log.debug/audit/error/emergency({...})` needs `title`                                                               | `log-args` `requireTitle`   |
| `logRequireDetails`            | warn     | :green_circle::large_blue_circle:               | ...needs `details`                                                                                                   | `log-args` `requireDetails` |
| `noLogModule`                  | warn     | :key:                                           | Opt-in opposite of `noMissingModules`: use the global `log`, not `N/log`                                             | `no-log-module`             |
| `entryPoints`                  | error    | :large_blue_circle:                             | Returned entry points must belong to one script type and include its required ones                                   | `entry-points`              |
| `noMissingModules`             | error    | :green_circle::large_blue_circle:               | A module used (`record.load()`, `log.debug()`) must be loaded in `define`/`import`                                   | none (from Oracle's skills) |
| `noGlobalShadowing`            | warn     | :green_circle::large_blue_circle:               | No variable named `log` or `util` other than the N/log, N/util module itself                                         | none (from Oracle's skills) |
| `noEval`                       | error    | :green_circle::large_blue_circle:               | No `eval`, `new Function` or string-form `setTimeout`/`setInterval`                                                  | none (OWASP skill)          |
| `noDynamicSuiteQL`             | warn     | :green_circle::large_blue_circle:               | `runSuiteQL` queries use `?` placeholders, not concatenation or template literals                                    | none (OWASP skill)          |
| `noSuiteScript1Api`            | error    | :green_circle::large_blue_circle:               | No `nlapi*`/`nlobj*` (SuiteScript 1.0) leftovers                                                                     | none (upgrade skill)        |
| `noModuleScopeApiCalls`        | warn     | :green_circle::large_blue_circle:               | No `N/` API calls while the `define` callback runs; initialize from entry points                                     | none (SAFE guide)           |
| `noRecordInLoop`               | warn     | :large_blue_circle:                             | No `record.load`/`record.create` inside loops or `forEach`/`each`/`map` callbacks                                    | none (SAFE guide)           |
| `noNativeIterators`            | warn     | :large_blue_circle:                             | No generator functions or `Symbol.iterator` (GraalJS)                                                                | none (SAFE guide)           |
| `noWrongScriptTypeModules`     | error    | :green_circle::large_blue_circle:               | No client-only module (`N/currentRecord`, `N/ui/dialog`) in a server script, or a server-only one in a client script | none (Oracle docs)          |
| `noBrowserGlobals`             | error    | :green_circle::large_blue_circle:               | No `document`, `window`, `localStorage`, `XMLHttpRequest`, `alert` or `navigator` in server scripts                  | none (Oracle docs)          |
| `noBeforeSubmitRecordReload`   | error    | :large_blue_circle:                             | No `record.load`/`submitFields`/`delete` of `context.newRecord.id` inside `beforeSubmit`                             | none (Oracle docs)          |
| `noEmptyEntryPoints`           | warn     | :large_blue_circle:                             | A returned entry point with an empty body                                                                            | none (Oracle docs)          |
| `noMapReduceSearchResults`     | warn     | :large_blue_circle:                             | `getInputData` returns the search object, not `getRange()` results                                                   | none (Oracle docs)          |
| `noHardcodedSecrets`           | error    | :key:                                           | Opt-in only: no string literal assigned to `password`, `secret`, `apiKey`, ...                                       | none (Oracle docs)          |
| `noUserEventContextSave`       | error    | :green_circle::large_blue_circle:               | No `.save()` on `context.newRecord` or `context.oldRecord` in user events                                            | none (Oracle docs)          |
| `noInsecureHttpsUrl`           | error    | :green_circle::large_blue_circle:               | No `http://` URL passed to `https.*` (N/https refuses plain HTTP)                                                    | none (Oracle docs)          |
| `requireCustpagePrefix`        | warn     | :large_blue_circle:                             | The `id` of a UI object added to a form (`addField`, `addTab`, ...) starts with `custpage`                           | none (Oracle docs)          |
| `noHeaderUnderscores`          | warn     | :large_blue_circle:                             | No underscore in a custom `https.*` header name                                                                      | none (Oracle docs)          |
| `noQueryColumnFieldAndFormula` | error    | :large_blue_circle:                             | A query column cannot set both `fieldId` and `formula`                                                               | none (Oracle docs)          |
| `requireClientValidateReturn`  | warn     | :large_blue_circle:                             | `saveRecord` and `validate*` return a value (only a body with no `return <value>` is flagged)                        | none (Oracle docs)          |
| `noClientLog`                  | warn     | :large_blue_circle:                             | `log.*` is ignored in client scripts attached to a form; use `console`                                               | none (Oracle docs)          |

Presets (`biome-plugin-suitescript/presets/<name>`):

:white_circle: `minimal` · :green_circle: `recommended` · :large_blue_circle: `all` (a superset of `recommended`) · :key: in no preset, add the rule yourself (see [Opt-in rules and typings](#opt-in-rules-and-typings))

`noAmdName`, `noExtraModules` and `noModuleExtensions` only apply to `define()`. The rest cover `import` too.

Suppress a diagnostic with `// biome-ignore lint/plugin: reason`.

### Opt-in rules and typings

`noHardcodedSecrets` is in no preset. It guesses from names (`password`, `passwd`, `pwd`, `secret`, `apiKey`,
`clientSecret`, `tokenSecret`, `consumerSecret`, exact match only) rather than knowing a value is a credential, so it
can misfire on look-alike names, and you should decide whether that trade is worth it: add
`"biome-plugin-suitescript/noHardcodedSecrets"` to `plugins` yourself. Oracle says "Do not hard-code any passwords
in scripts."

The rules assume you type-check against [`@hitc/netsuite-types`](https://github.com/headintheclouddev/typings-suitescript-2.0),
which already rejects wrong option names, missing parameters and positional-argument calls to N/ methods (their
signatures take an options object). Plain JavaScript projects get none of that from these rules.

### Logging and `N/log`

Oracle's own agent skills disagree on whether `N/log` must be loaded: one says the global exists but loading is
recommended, another says it is not global. This package takes the consistent position that a module you use
should be loaded, so `noMissingModules` requires `N/log` when `log.` is called. `noLogModule` is the opposite style
for projects that prefer the global, so enable only one of the two (`presets/all` omits `noLogModule`).

### Rules drawn from Oracle's documentation

`noWrongScriptTypeModules`, `noBrowserGlobals`, `noBeforeSubmitRecordReload`, `noEmptyEntryPoints` and
`noMapReduceSearchResults`, plus the later additions listed in the table above marked Oracle docs, come from Oracle's SuiteScript help-center pages and cover what type checking against
`@hitc/netsuite-types` cannot (the typings accept every signature involved). The client-only and server-only module
lists are copied from Oracle's module reference table, and `noWrongScriptTypeModules` and `noBrowserGlobals` only fire
when the script type can be inferred from the returned entry points. `noBeforeSubmitRecordReload` only matches calls
whose `id` is `...newRecord.id`. `noMapReduceSearchResults` only detects `.getRange()` results.

### Rules drawn from Oracle's agent skills

`noMissingModules`, `noGlobalShadowing`, `noEval`, `noDynamicSuiteQL`, `noSuiteScript1Api`, `noModuleScopeApiCalls`,
`noRecordInLoop` and `noNativeIterators` come from Oracle's
[agent skills](https://github.com/oracle/netsuite-suitecloud-sdk/tree/master/packages/agent-skills) (SuiteScript
upgrade, OWASP secure coding and the SAFE guide). `noMissingModules` leaves `util` alone because it is a global.
`noDynamicSuiteQL` does not flag a bare variable, whose contents it cannot see. `noRecordInLoop` is opt-in because
a Map/Reduce `map` entry point legitimately handles one record per call.

### `entryPoints` and script types

Biome plugins cannot read comments, so the script type is **inferred from what the module returns**
(`beforeLoad` → User Event, `onRequest` → Suitelet, ...). The rule reports mixed entry points
(`pageInit` with `execute`) and missing required ones (Map/Reduce needs `getInputData` and `map` or `reduce`).
Modules that return no distinctive entry point are libraries and are ignored. Generic names such as
`get`, `post`, `map` and `run` alone never make a module a script.

### Choosing what to enforce

- **Pick rules.** `log-args`' two options are the separate `logRequireTitle` / `logRequireDetails` rules.
- **Scope with `includes`.** For example, the global `log` is not available in client scripts:

  ```jsonc
  { "path": "biome-plugin-suitescript/noLogModule", "includes": ["src/**", "!src/**/client/**"] }
  ```
- **Custom module identifiers.** Generate a rule with your own mapping (and omit `moduleVars`):

  ```sh
  npx biome-plugin-suitescript generate module-vars --set N/record=nRecord --out plugins/module-vars.js
  ```

  then add `"./plugins/module-vars.js"` to `plugins`.

## Tag checker

`@NApiVersion` and `@NScriptType` live in comments, which no Biome plugin can read, so a small CLI checks them.
It is **report-only**: it never edits files.

```sh
npx biome-plugin-suitescript check                      # uses biome-plugin-suitescript.json
npx biome-plugin-suitescript check "src/**/*.ts"        # or explicit globs
npx biome-plugin-suitescript check --format github      # text (default) | json | github
```

It reports:

- `@NApiVersion` other than `2.1` (2.0, 2.x, 1.0 and invalid values), or missing when the file is a script.
- `@NScriptType` with no or an invalid value, or missing when the returned entry points imply one.
- A module from the wrong side of the declared script type (for example `N/file` in a client script), or one the declared type does not support at all (`N/http`, `N/https`, `N/llm` and `N/sftp` in a custom tool; custom modules in a bundle installation script).
- A declared script type that does not match the returned entry points, or lacks its required ones.

Files with no tags and no implied entry points (libraries) are skipped. For scripts still on 1.0, 2.0 or 2.x, the
output points to Oracle's
[`netsuite-suitescript-upgrade`](https://github.com/oracle/netsuite-suitecloud-sdk/tree/master/packages/agent-skills/netsuite-suitescript-upgrade)
agent skill for the conversion.

Exit codes: `0` clean, `1` problems found, `2` usage or configuration error.

### Configuration

List only the **script sources**: files deployed to the file cabinet, or the sources they are transpiled from (not
the transpiled output, and not build files such as `swc.mts`). The CLI refuses to run without a list rather than
guessing from `deploy.xml`.

```jsonc
// biome-plugin-suitescript.json
{
    "$schema": "./node_modules/biome-plugin-suitescript/schema.json",
    "includes": ["src/TypeScripts/**/*.{js,ts}", "!**/*.d.ts", "!**/*.test.*"]
}
```

`!` negation works as in Biome's `includes`. Reuse the same globs in the plugin `includes` in `biome.json` to scope the
Biome rules identically.

## Development

The source is TypeScript under `src/`, compiled by `tsc` to `dist/` (the only code that is published). Scripts and
tests are TypeScript too and run directly on Node. Node and npm versions come from `devEngines` in `package.json`
(also in `.nvmrc` and `.tool-versions`).

```sh
npm install
npm run build          # tsc -> dist/, copies GritQL rules, regenerates biome-manifest.json
npm run typecheck      # tsc --noEmit over src, scripts and tests
npm run check          # biome check (npm run format applies fixes)
npm run sync-modules   # refreshes the N/ module list from @hitc/netsuite-types
npm test               # builds first, then tests the built package
```

Git hooks (lefthook) run Biome on staged files before commit and reinstall dependencies after checkout or merge.

Commits follow [Conventional Commits](https://www.conventionalcommits.org); release-please opens a release PR and
publishes to npm when it is merged, using npm trusted publishing (OIDC, no token; the package settings on npmjs.com
allow this repo and `release.yml`). Dependencies are managed by Renovate: dev
dependencies are pinned, the `@biomejs/biome` peer range stays a caret, and Biome and `@biomejs/runtime` update together.

MIT licensed. Module and script-type data and rule behavior derive from the MIT-licensed ESLint plugins above.
