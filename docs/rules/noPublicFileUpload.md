<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noPublicFileUpload`

No `isOnline: true` (public file).

- **Severity:** warn
- **Presets:** none (opt-in)
- **Opt-in:** public assets legitimately set `isOnline`

## Example

Flagged when this rule alone is enabled:

```js
file.isOnline = true;
```

Reported as warning: isOnline: true makes the file publicly accessible. (`r-server.js`, line 60).

## Rule source

- Tier 0: [ADR 0005](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0005-guessing-rules-are-in-no-preset.md)
- Tier 1: [OWASP skill: file upload](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/references/07-file-upload-download.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noPublicFileUpload"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
