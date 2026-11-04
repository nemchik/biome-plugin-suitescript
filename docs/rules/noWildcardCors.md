<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noWildcardCors`

No `Access-Control-Allow-Origin: *` response header.

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
context.response.setHeader({ name: 'Access-Control-Allow-Origin', value: '*' });
```

Reported as warning: Do not allow every origin with Access-Control-Allow-Origin: *; list the allowed origins. (`r-server.js`, line 3).

## Rule source

- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noWildcardCors"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
