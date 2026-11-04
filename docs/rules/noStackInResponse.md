<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noStackInResponse`

No `.stack` inside `response.write`/`writeLine` arguments.

- **Severity:** warn
- **Presets:** none (opt-in)
- **Opt-in:** a stack returned from a RESTlet is not detected, and the skill's own logging example includes `e.stack`

## Example

Flagged when this rule alone is enabled:

```js
context.response.write({ output: e.stack });
```

Reported as warning: Do not send a stack trace to the client. (`r-server.js`, line 11).

## Rule source

- Tier 0: [ADR 0005](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0005-guessing-rules-are-in-no-preset.md)
- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noStackInResponse"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
