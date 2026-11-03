# Rule priority

How to decide where a new rule comes from, whether it belongs here at all, and which rule wins when two disagree. Read this before adding or changing a rule.

## Tier 0: repository decisions

Tier 0 holds decisions made in this repository that override every source: Oracle's skills and documentation, the ESLint plugins that inspired rules, type definitions and Biome's own behavior. It is not a source and has no external link. Every Tier 0 entry is an ADR in `docs/adr/`, so its reasons are recorded. The decisions today:

- [ADR 0002](adr/0002-options-are-separate-rules.md): rule options are separate rules (`logRequireTitle`, `logRequireDetails`).
- [ADR 0004](adr/0004-assume-suitescript-2-1-only.md): assume SuiteScript 2.1 only.
- [ADR 0005](adr/0005-guessing-rules-are-in-no-preset.md): rules that guess are in no preset.
- [ADR 0006](adr/0006-log-is-a-global-with-two-opposite-styles.md): `log` is a global, with two opposite styles.

Process rules for agents (read sources in full, never truncate) are in `AGENTS.md`, not here, and the architecture ADRs 0001 and 0003 have no outside source to override. Add a Tier 0 ADR only when a decision departs from a source or from Biome's behavior and is hard to reverse, surprising without context and a real trade-off.

## Source tiers

Rules come from one of four tiers of sources. When sources disagree, the lower tier number wins, and a Tier 0 decision wins over all of them.

1. **Oracle SuiteCloud SDK agent skills**: `packages/agent-skills` in `oracle/netsuite-suitecloud-sdk`. Skills rank in this order, and inside a skill the main `SKILL.md` outranks its `references/` and appendices:
   1. `netsuite-owasp-secure-coding`
   2. `netsuite-sdf-safe-guide`
   3. `netsuite-suitescript-upgrade`
   4. `netsuite-suitescript-learning` (last of the four because it contradicts the upgrade skill on `N/log`)

   Skills we have not drawn rules from (finance analyst, roles and permissions, records reference, UIF/SPA reference, project documentation, AI connector) rank below these four. Use them only if they state something that applies to SuiteScript source. A new rule that draws from a skill not ranked above must add that skill to the ranking in the same change, at the position its authority warrants.
2. **Oracle documentation**: the NetSuite help center (SuiteScript 2.1 module, script type and best-practice pages).
3. **SuiteScript-specific rules**: anything about SuiteScript that does not apply to JavaScript in general, from any other source (community plugins, our own experience of the platform).
4. **Generic JavaScript rules**: JavaScript checks that benefit SuiteScript and that Biome does not already cover. See [Generic JavaScript rules](#generic-javascript-rules).

## Conflicts

The agent skills (tier 1) outrank Oracle's documentation (tier 2) for two reasons. Oracle's documentation has known mistakes (for example, the N/https default `Content-Type` table contradicts the `https.post` page, the `createSecretKey` sample uses an option the method page does not list, and the `sendRedirect` page says parameters must be prefixed `custparam` while its own sample does not). And the skills are written for agents, to steer code toward best practices that the documentation may not cover. The skills also contradict each other and sometimes themselves, which is why they are ranked among themselves and why `SKILL.md` outranks its references.

Do not weaken or drop a rule because a lower-ranked source disagrees. When a skill's claim loses to a higher-ranked source (as the learning skill's "`N/log` is not global" does), say so in the rule's source comment.

A rule that is `error` because a skill says the code fails, with nothing in the documentation to confirm it, keeps its severity. Its source comment says the claim comes only from the skill and has not been checked against the documentation, so a later check can confirm it or downgrade the rule.

Overriding a higher-ranked source or Biome's behavior is allowed only as a Tier 0 decision: write the ADR, then cite it in the rule's source comment and in the README "Rule source" column, naming the source being overridden.

## Severity and presets

Defaults, which a rule's author may override with a recorded reason:

- A rule from any tier whose violation would fail at runtime or on upload is `error` and goes in `recommended`.
- Tier 1 and 2 conventions are `warn`. They go in `recommended` when the source states them as a requirement ("must", "do not") and in `all` when it only recommends them.
- Tier 3 conventions are `warn` and go in `all`.
- Tier 4 rules are opt-in (in no preset) unless they would fail at runtime or on upload.
- A rule that guesses (a heuristic that can misfire) stays out of `recommended`, and out of every preset when a false positive would be costly.

## Native Biome rules

When Biome already ships a rule for what an Oracle source asks, do not reimplement it. Turn the rule on in the preset configs (`NATIVE_RULES` in `scripts/build-manifest.ts`, which writes `configs/minimal.json`, `recommended.json` and `all.json`), even when Biome enables it by default or in its recommended set, and list it in the README rules table as Tier 4 with a link to Biome's documentation. List only the native rules enabled because a Tier 1 or Tier 2 source asks for them; the configs enable Biome's own recommended rules too, but those are not listed. Include nursery rules when they solve an Oracle concern, and note that they may change. Turn off any Biome rule that conflicts with one of ours (as `noUnusedFunctionParameters` is, because `noExtraParams` wants one callback parameter per dependency). A plugin cannot extend or scope a native rule, so a check that needs script-type awareness stays a plugin rule (`noBrowserGlobals` and Biome's `noAlert`).

## Low-confidence rules

A rule whose source is clear but whose detection guesses (it reads names, sees only literals, or cannot tell intent) may still be written. Put it in no preset, mark it opt-in in the README rules table, and give the reason there. Do not write a rule when its sources contradict themselves or when it needs information a static AST cannot provide.

## Generic JavaScript rules

Do not add a generic JavaScript rule just because it is good practice. Add one only when all of these hold:

- It has a SuiteScript-specific justification: a platform behavior (such as the GraalJS runtime) or a statement in a tier 1 or 2 source.
- Biome's built-in rules do not already cover it. Check Biome's rule list first, and prefer enabling the Biome rule in a consumer's config over reimplementing it.
- The rule's source comment names that justification.

If Biome later ships an equivalent, remove or deprecate our rule.

## SuiteScript version

Always assume SuiteScript 2.1 explicitly. Do not consider SuiteScript 1.0, 2.0 or 2.x in current or future rules, configs, tests or documentation, because Oracle is deprecating them. Never document how to override or disable a rule to keep backwards compatibility with those versions. The one exception is a rule whose purpose is to flag 1.0 leftovers (such as `noSuiteScript1Api`).

## Reading Oracle sources

When reading Oracle documentation or agent skills, never truncate: read each page or file in full, page through anything long, and read every material it references. A summary, an excerpt or a search snippet is not a reading. Quote the source verbatim in the rule's comment and say which file or page it came from.

## Recording the source

Every rule's source comment names its tier and source, and the README "Rule source" column links to it, prefixed with its tier. A rule shaped by a Tier 0 decision also names the ADR in its comment, and the README cell starts with `Tier 0: [ADR NNNN](...)`. Tier 0 does not change where the rule sorts in the table, which uses its lowest source tier.
