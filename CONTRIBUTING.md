# Contributing

Thanks for helping. Bug reports, rule proposals, fixes and docs are all welcome. By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). For a security problem, follow [SECURITY.md](SECURITY.md) instead of opening an issue.

Good places to start are issues labelled [`good first issue`](https://github.com/nemchik/biome-plugin-suitescript/labels/good%20first%20issue) and [`help wanted`](https://github.com/nemchik/biome-plugin-suitescript/labels/help%20wanted). Say on the issue that you are picking one up.

## Set up

You need the Node.js and npm versions in `package.json` `devEngines` (also in `.nvmrc` and `.tool-versions`).

```sh
npm install
npm run skills:install   # restores the agent skills and links them for Claude Code; optional unless you use agents
npm run build
npm test
```

`npm run format` applies Biome's fixes and type-checks. The README's Development section lists the other scripts. Git hooks (lefthook) run Biome on staged files before each commit.

## Changing or adding a rule

Read [docs/rule-priority.md](docs/rule-priority.md) first. It says which sources a rule may come from, which wins when they disagree, and what severity and preset the rule gets. Assume SuiteScript 2.1 only. Do not add a generic JavaScript rule unless it has a SuiteScript-specific justification and Biome does not already cover it.

Start a new rule with the scaffold, giving it the tier of its source (1 Oracle agent skill, 2 type definitions, 3 Oracle documentation, 4 SuiteScript-specific, 5 generic JavaScript):

```sh
npm run new-rule -- noFooBar --tier 3          # a TypeScript rule
npm run new-rule -- noFooBar --tier 3 --grit   # a GritQL rule
```

In PowerShell, quote the separator (`npm run new-rule '--' noFooBar --tier 3`), because PowerShell otherwise swallows the bare `--`. The scaffold creates the rule file in `src/rules/`, a fixture in `test/fixtures/`, a case in `test/cases.ts` and an entry in `scripts/rule-sources.ts`, and it prints what is left. Each placeholder is marked `TODO(new-rule)`, and `npm test` fails until none is left, because the tier, severity and preset are decisions for you (the tier's defaults are in the rule file's comment):

1. Write the rule, and name its tier and source in its comment, quoting the source.
2. Make the fixture report the rule, and set the expected count in `test/cases.ts`.
3. Fill in the description, sources and any opt-in reason in `scripts/rule-sources.ts`, and add the rule to the right preset list in `scripts/build-manifest.ts` (or leave it opt-in).
4. Run `npm run build`, `npm run docs` and `npm run readme`, and commit the results.

Generated files (`biome-manifest.json`, `configs/`, `src/lib/modules.ts`, `src/lib/typings-data.ts`, the README rules table) come from scripts. Change the source and regenerate; do not edit them by hand. [GLOSSARY.md](GLOSSARY.md) defines the terms used across the code, and [docs/adr/](docs/adr/) records the decisions that override a source.

## Pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`, `ci:`...); release-please builds the changelog and versions from them.
- Run `npm run format` and `npm test` before pushing. CI runs `biome ci --error-on-warnings`, `tsc` and the tests against the pinned and the latest Biome.
- Keep a pull request to one concern, and link the issue it closes.

Maintainers: see [docs/maintaining.md](docs/maintaining.md) for the scheduled workflows. Agents: see [AGENTS.md](AGENTS.md).
