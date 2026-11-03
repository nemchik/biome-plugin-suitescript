# Rule priority

How to decide where a new rule comes from, whether it belongs here at all, and which rule wins when two disagree. Read this before adding or changing a rule.

## Source tiers

Rules come from one of four tiers, highest priority first.

1. **Oracle documentation**: the NetSuite help center (SuiteScript 2.1 module, script type and best-practice pages).
2. **Oracle SuiteCloud SDK agent skills**: `packages/agent-skills` in `oracle/netsuite-suitecloud-sdk`. Skills rank in this order, and inside a skill the main `SKILL.md` outranks its `references/` and appendices:
   1. `netsuite-owasp-secure-coding`
   2. `netsuite-sdf-safe-guide`
   3. `netsuite-suitescript-upgrade`
   4. `netsuite-suitescript-learning` (last of the four because it contradicts the upgrade skill on `N/log`)

   Skills we have not drawn rules from (finance analyst, roles and permissions, records reference, UIF/SPA reference, project documentation, AI connector) rank below these four. Use them only if they state something that applies to SuiteScript source. A new rule that draws from a skill not ranked above must add that skill to the ranking in the same change, at the position its authority warrants.
3. **SuiteScript-specific rules**: anything about SuiteScript that does not apply to JavaScript in general, from any other source (community plugins, our own experience of the platform).
4. **Generic JavaScript rules**: JavaScript checks that benefit SuiteScript and that Biome does not already cover. See [Generic JavaScript rules](#generic-javascript-rules).

## Conflicts

A higher tier wins over a lower one, and inside tier 2 the skill order above decides. Do not weaken or drop a higher-tier rule because a lower tier disagrees.

Overriding a higher tier is allowed only as a deliberate decision. Record it in the rule's source comment and in the README, with the reason and the source being overridden, as `noLogModule` and `noMissingModules` do for Oracle's contradictory `N/log` guidance.

## Severity and presets

Defaults, which a rule's author may override with a recorded reason:

- A rule from any tier whose violation would fail at runtime or on upload is `error` and goes in `recommended`.
- Tier 1 and 2 conventions are `warn`. They go in `recommended` when the source states them as a requirement ("must", "do not") and in `all` when it only recommends them.
- Tier 3 conventions are `warn` and go in `all`.
- Tier 4 rules are opt-in (in no preset) unless they would fail at runtime or on upload.
- A rule that guesses (a heuristic that can misfire) stays out of `recommended`, and out of every preset when a false positive would be costly.

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

Every rule's source comment names its tier and source, and the README "Rule source" column links to it, prefixed with its tier.
