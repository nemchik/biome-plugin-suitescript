# SuiteScript Biome Plugins

Biome lint rules for NetSuite SuiteScript, distributed as one npm package so consumers choose what to enforce.

## Language

**Rule**:
A single lint check, written in GritQL or JavaScript, that a consumer enables by name.
_Avoid_: Check, plugin (a plugin is the package or one `plugins` entry, not one check)

**Preset**:
A named group of rules a consumer enables together (`recommended`, `minimal`, `all`).
_Avoid_: Config, ruleset

**Module** (SuiteScript):
A SuiteScript file declaring its dependencies and returning its public functions, as AMD `define()` or as ES `import`/`export` syntax.
_Avoid_: Script (a script is a module whose returned functions are entry points)

**Entry point**:
A function NetSuite calls by name on a module's returned object (for example `beforeLoad`, `onRequest`).
_Avoid_: Handler, hook

**Script type**:
The kind of NetSuite script a module implements, which fixes its valid and required entry points.
_Avoid_: Script kind

**Inferred script type**:
The script type deduced from which entry points a module returns, because tags and folders are not available to rules.
_Avoid_: Detected type

**Tag check**:
The CLI validation of `@NApiVersion` and `@NScriptType` comment tags, which no Biome rule can read.
_Avoid_: Tag rule

**Script source**:
A file a consumer authors that ends up in the NetSuite file cabinet, either as-is or after transpiling. Build outputs are not script sources.
_Avoid_: Deployed file (that is the transpiled output)

**Source tier**:
The priority level of where a rule's requirement comes from (Oracle agent skills, type definitions, Oracle documentation, SuiteScript-specific rules, which may be opinionated, generic JavaScript rules). When sources conflict, the lower tier number wins. Tier 0 is not a source: it is a repository decision, recorded as an ADR, that overrides every source.
_Avoid_: Rule level, rule weight

**Verification**:
A test run in a NetSuite account to confirm what the platform really does, documented with the script, the NetSuite version, the results and the decision it led to. It is evidence, not a source tier: it overrides a source's claim about platform behavior, but not a recommendation.
_Avoid_: Check (a check is what a rule or the CLI does), validation

**Probe**:
A version-controlled script module that exercises one platform behavior and returns what happened as data. It cites the contradictions or rules it verifies, and each has a results page.
_Avoid_: Test (a test is what `npm test` runs), snippet (a snippet is pasted by hand and not recorded)

**Runner**:
The single script deployed to a sandbox that runs a probe on request, identified by name from a fixed list of probes. It never runs code supplied in the request.
_Avoid_: Harness

**Contradiction**:
Two sources (Oracle agent skills, type definitions, Oracle documentation) that disagree, or one that disagrees with itself. Each is tracked until a verification settles it.
_Avoid_: Conflict (the source tiers resolve a conflict between sources; a contradiction is what needs verifying)

**Generic JavaScript rule**:
A rule that applies to JavaScript in general rather than to SuiteScript. It is added only when it explicitly benefits SuiteScript and Biome does not already cover it.
_Avoid_: General rule

**Config**:
A published `extends` entry (`configs/minimal`, `recommended`, `all`) that bundles a preset with the native Biome rules a source tier asks for and the SuiteScript globals.
_Avoid_: Preset (a preset lists only this package's rules)
