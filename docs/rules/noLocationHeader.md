<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noLocationHeader`

No `Location` header built from a variable; use `N/redirect`.

- **Severity:** warn
- **Presets:** none (opt-in)
- **Opt-in:** the value may already be validated, and the skill's references still set `Location` after sanitising it

## Example

Flagged when this rule alone is enabled:

```js
context.response.setHeader({ name: 'Location', value: target });
```

Reported as warning: Use N/redirect instead of writing a Location header from a variable. (`r-server.js`, line 7).

## Rule source

- Tier 0: [ADR 0005](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0005-guessing-rules-are-in-no-preset.md)
- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noLocationHeader"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
