<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noInvalidDefine`

`define()` has one of the valid AMD shapes (a function or object factory, an optional name and dependency array).

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
define();
```

Reported as error: define() needs a factory. (`define-shapes.js`, line 1).

## Rule source

- Tier 4: [acdvs `no-invalid-define`](https://github.com/acdvs/eslint-plugin-amd/blob/main/lib/rules/no-invalid-define.ts)

Enable it with `"plugins": ["biome-plugin-suitescript/noInvalidDefine"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
