<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noBrowserGlobals`

No `document`, `window`, `localStorage`, `XMLHttpRequest`, `alert`, `navigator`, `URLSearchParams` or `fetch` in server scripts.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
document.title = 'x';
```

Reported as error: 'document' does not exist in server scripts. (`side-server.js`, line 4).

## Rule source

- Tier 1: [SAFE guide](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-sdf-safe-guide/SKILL.md)
- Tier 3: [Oracle help: FAQ](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N3917921.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noBrowserGlobals"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
