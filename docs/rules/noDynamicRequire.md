<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noDynamicRequire`

`require()` takes string literal module names, not expressions.

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
require(['N/' + id], () => {});
```

Reported as warning: Pass require() a string literal module name, not an expression. (`dynamic-require.js`, line 4).

## Rule source

- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)
- Tier 4: [acdvs `no-dynamic-require`](https://github.com/acdvs/eslint-plugin-amd/blob/main/lib/rules/no-dynamic-require.ts)

Enable it with `"plugins": ["biome-plugin-suitescript/noDynamicRequire"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
