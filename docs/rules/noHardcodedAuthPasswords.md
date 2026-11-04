<!--
  This page is generated. Do not edit it by hand: manual edits will be rejected.
  To change it, edit the rule's entry in scripts/rule-sources.ts (description, sources,
  opt-in reason) or the fixture and cases in test/cases.ts, then run `npm run build`
  and `npm run docs` and commit the result. See docs/rule-priority.md.
-->

# `noHardcodedAuthPasswords`

No string literal passed as a password to `auth.changePassword`/`changeEmail`.

- **Severity:** warn
- **Presets:** recommended, all

## Example

Flagged when this rule alone is enabled:

```js
auth.changePassword({ currentPassword: 'a', newPassword: 'b' });
```

Reported as warning: Do not hard-code the currentPassword in a script. (`r-server.js`, line 47).

## Rule source

- Tier 3: [Oracle help: security considerations](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_159804448843.html)
- Tier 3: [Oracle help: auth.changePassword](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4298157647.html)

Enable it with `"plugins": ["biome-plugin-suitescript/noHardcodedAuthPasswords"]` or through a preset. See the [README](https://github.com/nemchik/biome-plugin-suitescript#readme).
