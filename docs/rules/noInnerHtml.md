<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noInnerHtml`

No non-static value assigned to `innerHTML`/`outerHTML` or passed to `insertAdjacentHTML`/`document.write` (client scripts).

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
el.innerHTML = userInput;
```

Reported as warning: Do not write unsanitized HTML; use textContent for untrusted data. (`r-client.js`, line 5).

## Rule source

- Tier 1: [OWASP skill](https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/netsuite-owasp-secure-coding/SKILL.md)

Enable it with `"plugins": ["biome-plugin-suitescript/noInnerHtml"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
