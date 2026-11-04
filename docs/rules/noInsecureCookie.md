<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noInsecureCookie`

A literal `Set-Cookie` value has `HttpOnly`, `Secure` and `SameSite`.

- **Severity:** warn
- **Presets:** none (opt-in)
- **Opt-in:** only literal values are checked, and we have not confirmed a Suitelet may set `Set-Cookie`

## Example

Flagged when this rule alone is enabled:

```js
context.response.setHeader({ name: 'Set-Cookie', value: 'sid=1' });
```

Reported as warning: Set-Cookie needs the HttpOnly, Secure and SameSite attributes. (`r-server.js`, line 5).

## Rule source

- Tier 0: [ADR 0005](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0005-guessing-rules-are-in-no-preset.md)
- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noInsecureCookie"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
