# Security policy

## Supported versions

Only the latest published version of `biome-plugin-suitescript` receives fixes.

## Reporting a vulnerability

Do not open a public issue. [Report it privately through GitHub](https://github.com/nemchik/biome-plugin-suitescript/security/advisories/new). Include the version, the rule or command involved, and the smallest SuiteScript file that shows the problem.

What counts as a vulnerability here:

- The package, its CLI (`biome-plugin-suitescript`) or its release workflow doing something harmful: running unexpected code, writing outside the paths it was given, or leaking credentials.
- A supply-chain weakness in how the package is built or published (see `.github/workflows/release.yml`; publishing uses npm trusted publishing with no stored token).

A rule that misses an insecure pattern, or flags safe code, is a normal bug: open an issue.
