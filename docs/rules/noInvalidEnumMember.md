<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noInvalidEnumMember`

A member of a module enum (`record.Type.CUSTOMR`) is one the type definitions list.

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
record.Type.CUSTOMR;
```

Reported as warning: CUSTOMR is not a member of record.Type. (`r-typings.js`, line 7).

## Rule source

- Tier 2: [headintheclouddev `N/*`](https://github.com/headintheclouddev/typings-suitescript-2.0/tree/master/N)

Enable it with `"plugins": ["biome-plugin-suitescript/noInvalidEnumMember"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
