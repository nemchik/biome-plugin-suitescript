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

For each rule:

1. Write the rule in `src/rules/` and name its tier and source in a comment, quoting the source.
2. Add cases to the tests in `test/`.
3. Add its description, sources and any opt-in reason to `scripts/rule-sources.ts`.
4. Run `npm run build`, then `npm run readme`, and commit the results.

Generated files (`biome-manifest.json`, `configs/`, `src/lib/modules.ts`, `src/lib/typings-data.ts`, the README rules table) come from scripts. Change the source and regenerate; do not edit them by hand. [GLOSSARY.md](GLOSSARY.md) defines the terms used across the code, and [docs/adr/](docs/adr/) records the decisions that override a source.

## Pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`, `ci:`...); release-please builds the changelog and versions from them.
- Run `npm run format` and `npm test` before pushing. CI runs `biome ci --error-on-warnings`, `tsc` and the tests against the pinned and the latest Biome.
- Keep a pull request to one concern, and link the issue it closes.

Maintainers: see [docs/maintaining.md](docs/maintaining.md) for the scheduled workflows. Agents: see [AGENTS.md](AGENTS.md).
