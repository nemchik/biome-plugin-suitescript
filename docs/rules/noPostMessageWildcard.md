<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noPostMessageWildcard`

No `'*'` target origin in `postMessage`.

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
window.parent.postMessage(data, '*');
```

Reported as warning: Pass postMessage() a specific target origin, never '*'. (`r-client.js`, line 3).

## Rule source

- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noPostMessageWildcard"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
