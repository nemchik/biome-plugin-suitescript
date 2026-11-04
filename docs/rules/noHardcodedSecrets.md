<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noHardcodedSecrets`

No string literal assigned to `password`, `secret`, `apiKey`, ....

- **Severity:** error
- **Presets:** none (opt-in)
- **Opt-in:** it guesses from names, so it can misfire on look-alike names

## Example

Flagged when this rule alone is enabled:

```js
const password = 'hunter2';
```

Reported as error: Do not hard-code 'password'; use an API Secret (https.createSecureString) instead of source code. (`secrets.js`, line 2).

## Rule source

- Tier 0: [ADR 0005](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0005-guessing-rules-are-in-no-preset.md)
- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)
- Tier 3: [Oracle help: security considerations](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_159804448843.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noHardcodedSecrets"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
