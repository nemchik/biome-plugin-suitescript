# Rule priority

How to decide where a new rule comes from, whether it belongs here at all, and which rule wins when two disagree. Read this before adding or changing a rule.

## Tier 0: repository decisions

Tier 0 holds decisions made in this repository that override every source: Oracle's skills and documentation, the ESLint plugins that inspired rules, type definitions and Biome's own behavior. It is not a source and has no external link. Every Tier 0 entry is an ADR in `docs/adr/`, so its reasons are recorded. The decisions today:

- [ADR 0002](adr/0002-options-are-separate-rules.md): rule options are separate rules (`logRequireTitle`, `logRequireDetails`).
- [ADR 0004](adr/0004-assume-suitescript-2-1-only.md): assume SuiteScript 2.1 only.
- [ADR 0005](adr/0005-guessing-rules-are-in-no-preset.md): rules that guess are in no preset.
- [ADR 0006](adr/0006-suitescript-globals-have-two-opposite-loading-styles.md): `log` and `util` are SuiteScript globals, each with two opposite loading styles.

Process rules for agents (read sources in full, never truncate) are in `AGENTS.md`, not here, and the architecture ADRs 0001 and 0003 have no outside source to override. Add a Tier 0 ADR only when a decision departs from a source or from Biome's behavior and is hard to reverse, surprising without context and a real trade-off.

## Source tiers

Rules come from one of five tiers of sources. When sources disagree, the lower tier number wins, and a Tier 0 decision wins over all of them.

1. **Oracle SuiteCloud SDK agent skills**: `packages/agent-skills` in `oracle/netsuite-suitecloud-sdk`, read from this repo's copy in `.agents/skills/` (see [agent skills](agents/skills.md)). Skills rank in this order, and inside a skill the main `SKILL.md` outranks its `references/` and appendices:
   1. `netsuite-owasp-secure-coding`
   2. `netsuite-sdf-safe-guide`
   3. `netsuite-suitescript-upgrade`
   4. `netsuite-suitescript-learning` (last of the four because it contradicts the upgrade skill on `N/log`)

   Skills we have not drawn rules from (finance analyst, roles and permissions, records reference, UIF/SPA reference, project documentation, AI connector) rank below these four. Use them only if they state something that applies to SuiteScript source. A new rule that draws from a skill not ranked above must add that skill to the ranking in the same change, at the position its authority warrants.
2. **Type definitions**: community TypeScript definitions for the `N/` modules. They carry corrections for places where Oracle's documentation is inaccurate and tend to be more accurate than it, though they are not perfect, and a skill outranks them. A type definition can back a rule without confirmation from Oracle's documentation. The README names the project and says which version it is written for.
3. **Oracle documentation**: the NetSuite help center (SuiteScript 2.1 module, script type and best-practice pages).
4. **SuiteScript-specific rules**: anything about SuiteScript that does not apply to JavaScript in general (community plugins, our own experience of the platform). These rules may be opinionated: a good practice we recommend without a stronger source behind it belongs here, with the opinion and the reason stated in the rule's comment.
5. **Generic JavaScript rules**: JavaScript checks that benefit SuiteScript and that Biome does not already cover. See [Generic JavaScript rules](#generic-javascript-rules).

Verified behavior is not a tier. It decides whether a source's claim about the platform is true, and applies across every tier (see [Verified facts](#verified-facts)).

## Conflicts

The agent skills (tier 1) outrank the type definitions (tier 2), and the type definitions outrank Oracle's documentation (tier 3). Oracle's documentation has known mistakes (for example, the N/https default `Content-Type` table contradicts the `https.post` page, the `createSecretKey` sample uses an option the method page does not list, and the `sendRedirect` page says parameters must be prefixed `custparam` while its own sample does not), and the type definitions include corrections for such cases. The skills are written for agents, to steer code toward best practices that neither the documentation nor the type definitions cover. The skills also contradict each other and sometimes themselves, which is why they are ranked among themselves and why `SKILL.md` outranks its references.

Do not weaken or drop a rule because a lower-ranked source disagrees. When a source's claim loses to a higher-ranked one (as the learning skill's "`N/log` is not global" does, or a documentation page that a type definition contradicts), say so in the rule's source comment. Where a type definition and Oracle's documentation disagree, follow the type definition and note the disagreement there.

A rule that is `error` because a skill says the code fails, with nothing in the documentation to confirm it, keeps its severity. Its source comment says the claim comes only from the skill and has not been checked against the documentation, so a later check can confirm it or downgrade the rule.

Overriding a higher-ranked source or Biome's behavior is allowed only as a Tier 0 decision: write the ADR, then cite it in the rule's source comment and in the README "Rule source" column, naming the source being overridden.

## Verified facts

A verification is a test run in a NetSuite account, recorded in [`docs/verification/`](verification/README.md). It is evidence, not a source of rules, so it has no tier. It settles whether a source's claim about the platform is true.

- A verification overrides a source's claim about **what the platform does**: what an API accepts or rejects, whether something fails, whether a member exists or what it returns. Where an agent skill, the type definitions or Oracle's documentation says one thing and the verified behavior is another, the verified behavior wins, whatever the source's tier.
- A verification does not override a **recommendation**: a practice to follow or avoid, such as a security habit or "load `N/log` explicitly". A recommendation stands even when the platform works without following it, unless the verification proves the recommendation cannot work or rests on a false premise. Then drop or reshape the rule and record the decision on the results page.
- A claim nobody has verified stays marked "unverified" in the rule's comment and the README. Where sources contradict each other, the contradiction is listed in [`docs/verification/contradictions.md`](verification/contradictions.md) with its status, and the rule cites it.
- A decision that follows from a verification becomes a Tier 0 ADR only when it meets the ADR criteria (hard to reverse, surprising without context, a real trade-off). Otherwise the results page records it.

Document every verification: the test performed, the NetSuite version, the results, the explanation and the decision. [`docs/verification/README.md`](verification/README.md) has the methods and the template.

## Severity and presets

Defaults, which a rule's author may override with a recorded reason:

- A rule from any tier whose violation would fail at runtime or on upload is `error` and goes in `recommended`.
- Tier 1, 2 and 3 conventions are `warn`. They go in `recommended` when the source states them as a requirement ("must", "do not") and in `all` when it only recommends them.
- Tier 4 conventions are `warn` and go in `all`.
- Tier 5 rules are opt-in (in no preset) unless they would fail at runtime or on upload.
- A rule that guesses (a heuristic that can misfire) stays out of `recommended`, and out of every preset when a false positive would be costly.

## Native Biome rules

When Biome already ships a rule for what an Oracle source asks, do not reimplement it. Turn the rule on in the preset configs (`NATIVE_RULES` in `scripts/native-rules.ts`, which `scripts/build-manifest.ts` turns into `configs/minimal.json`, `recommended.json` and `all.json`), even when Biome enables it by default or in its recommended set, and list it in the README rules table as Tier 5 with a link to Biome's documentation. List only the native rules enabled because a Tier 1, 2 or 3 source asks for them; the configs enable Biome's own recommended rules too, but those are not listed. Include nursery rules when they solve an Oracle concern, and note that they may change. Turn off any Biome rule that conflicts with one of ours (as `noUnusedFunctionParameters` is, because `noExtraParams` wants one callback parameter per dependency). A plugin cannot extend or scope a native rule, so a check that needs script-type awareness stays a plugin rule (`noBrowserGlobals` and Biome's `noAlert`).

## Low-confidence rules

A rule whose source is clear but whose detection guesses (it reads names, sees only literals, or cannot tell intent) may still be written. Put it in no preset, mark it opt-in in the README rules table, and give the reason there. Do not write a rule when its sources contradict themselves or when it needs information a static AST cannot provide.

## Generic JavaScript rules

Do not add a generic JavaScript rule just because it is good practice. Add one only when all of these hold:

- It has a SuiteScript-specific justification: a platform behavior (such as the GraalJS runtime) or a statement in a tier 1, 2 or 3 source.
- Biome's built-in rules do not already cover it. Check Biome's rule list first, and prefer enabling the Biome rule in a consumer's config over reimplementing it.
- The rule's source comment names that justification.

If Biome later ships an equivalent, remove or deprecate our rule.

## SuiteScript version

Always assume SuiteScript 2.1 explicitly. Do not consider SuiteScript 1.0, 2.0 or 2.x in current or future rules, configs, tests or documentation, because Oracle is deprecating them. Never document how to override or disable a rule to keep backwards compatibility with those versions. The one exception is a rule whose purpose is to flag 1.0 leftovers (such as `noSuiteScript1Api`).

## Reading Oracle sources

When reading Oracle documentation or agent skills, never truncate: read each page or file in full, page through anything long, and read every material it references. A summary, an excerpt or a search snippet is not a reading. Quote the source verbatim in the rule's comment and say which file or page it came from.

## Recording the source

Every rule's source comment names its tier and source, and the README "Rule source" column links to it, prefixed with its tier. A rule shaped by a Tier 0 decision also names the ADR in its comment, and the README cell starts with `Tier 0: [ADR NNNN](...)`. Tier 0 does not change where the rule sorts in the table, which uses its lowest source tier.

The README table is generated: add the rule's description, sources and any opt-in reason to `scripts/rule-sources.ts`, run `npm run build` and then `npm run readme`, and commit the result. `test/readme.test.ts` fails when the table is stale.
