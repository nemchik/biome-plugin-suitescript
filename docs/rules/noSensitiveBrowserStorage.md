<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noSensitiveBrowserStorage`

No token- or password-named key in `localStorage`/`sessionStorage.setItem`.

- **Severity:** warn
- **Presets:** none (opt-in)
- **Opt-in:** it guesses from the key name

## Example

Flagged when this rule alone is enabled:

```js
localStorage.setItem('authToken', token);
```

Reported as warning: Do not keep 'authToken' in browser storage; any script on the page can read it. (`r-client.js`, line 12).

## Rule source

- Tier 0: [ADR 0005](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0005-guessing-rules-are-in-no-preset.md)
- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noSensitiveBrowserStorage"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
