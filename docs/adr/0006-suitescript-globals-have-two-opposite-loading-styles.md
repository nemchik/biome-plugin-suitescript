# SuiteScript globals have two opposite loading styles

SuiteScript 2.1 provides `log` and `util` as globals in every script type, and Oracle's sources disagree on whether the matching module should still be loaded:

- Oracle's documentation says the `log` object "is loaded by default for all script types. You do not need to load it manually", and describes `util` the same way.
- The upgrade skill says both are global but recommends loading `N/log` anyway, because "explicitly including it in `define()` makes dependencies clearer". It names only `N/log`; `requireUtilModule` applies the same recommendation to `util`.
- The learning skill says `N/log` is not globally available.

We follow the documentation and the higher-ranked upgrade skill on the fact: `noMissingModules` never asks for `log` or `util` to be loaded. Loading the module is then a style, and projects disagree, so each global has both styles as separate rules that must not be enabled together:

| Global | Requires the module (in `all`, following the upgrade skill) | Forbids the module (opt-in, following the documentation) |
| ------ | ----------------------------------------------------------- | -------------------------------------------------------- |
| `log`  | `requireLogModule`                                          | `noLogModule`                                            |
| `util` | `requireUtilModule`                                         | `noUtilModule`                                           |

Rules about what a global's methods do (`logRequireTitle`, `logRequireDetails`, `preferUtilTypeChecks`) never look at whether the module is loaded. They match the global's calls either way, and say nothing about importing.

## Adding a global

A SuiteScript global that Oracle documents as loaded by default gets the same pair of rules, named `require<Name>Module` and `no<Name>Module`, and a row in the table above. `toString()` (Oracle's replacement for `instanceof` on SuiteScript objects) is a candidate once its behavior is verified (see `docs/verification/`).

## Consequences

A consumer who enables a `require…Module` rule and its `no…Module` opposite gets a warning on every module. The README table says to enable only one of each pair.
