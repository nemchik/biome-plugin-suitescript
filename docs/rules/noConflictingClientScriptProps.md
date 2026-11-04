<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noConflictingClientScriptProps`

Do not set both `clientScriptFileId` and `clientScriptModulePath` on a form.

- **Severity:** error
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
form.clientScriptModulePath = './client.js';
```

Reported as error: Set either clientScriptFileId or clientScriptModulePath on form, not both. (`r-server.js`, line 43).

## Rule source

- Tier 3: [Oracle help: Form.clientScriptModulePath](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4625445350.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noConflictingClientScriptProps"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
