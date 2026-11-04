<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noClientLog`

`log.*` is ignored in client scripts attached to a form; use `console`.

- **Severity:** warn
- **Presets:** all

## Example

Flagged when this rule alone is enabled:

```js
log.debug('title', 'details');
```

Reported as warning: log.debug() is ignored in client scripts attached to a form; use console. (`client-validate.js`, line 3).

## Rule source

- Tier 3: [Oracle help: N/log](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4574548135.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noClientLog"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
