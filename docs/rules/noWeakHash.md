<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noWeakHash`

No `HashAlg.MD5` or `HashAlg.SHA1`.

- **Severity:** warn
- **Presets:** none (opt-in)
- **Opt-in:** it cannot tell a security use from a vendor integration that requires MD5 or SHA-1, and the type definitions list only `SHA256` and `SHA512` for `crypto.HashAlg`, so the member names come from the skill alone

## Example

Flagged when this rule alone is enabled:

```js
crypto.createHash({ algorithm: crypto.HashAlg.MD5 });
```

Reported as warning: MD5 and SHA-1 are broken; use SHA-256 or stronger for security-sensitive hashing. (`r-server.js`, line 13).

## Rule source

- Tier 0: [ADR 0005](https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/0005-guessing-rules-are-in-no-preset.md)
- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noWeakHash"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
