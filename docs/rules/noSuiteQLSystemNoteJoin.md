<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noSuiteQLSystemNoteJoin`

No `JOIN SystemNote` in a literal SuiteQL query.

- **Severity:** warn
- **Presets:** none (opt-in)
- **Opt-in:** a tightly filtered join is fine, and only literal queries are seen

## Example

Flagged when this rule alone is enabled:

```js
query.runSuiteQL({ query: 'SELECT id FROM customer JOIN SystemNote ON 1 = 1' });
```

Reported as warning: Do not join SystemNote in a SuiteQL query; query it separately with filters. (`r-server.js`, line 16).

## Rule source

- Tier 0: [ADR 0005](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0005-guessing-rules-are-in-no-preset.md)
- Tier 1: [SAFE guide](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-sdf-safe-guide/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noSuiteQLSystemNoteJoin"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
