# Changelog

## [0.7.0](https://github.com/nemchik/biome-plugin-suitescript/compare/biome-plugin-suitescript-v0.6.0...biome-plugin-suitescript-v0.7.0) (2026-11-14)


### Features

* oracle-doc, verify permission rules, AGENTS.md trim, switch prompts ([#102](https://github.com/nemchik/biome-plugin-suitescript/issues/102)) ([aa27d94](https://github.com/nemchik/biome-plugin-suitescript/commit/aa27d945219c701d1b4094004970e0011a3f1fab))
* run verification through the suitescript-verify package ([#134](https://github.com/nemchik/biome-plugin-suitescript/issues/134)) ([02f713c](https://github.com/nemchik/biome-plugin-suitescript/commit/02f713c98c4ec20deac438ce584ea3f826e57e09))


### Bug Fixes

* accept the SuiteCloud SDK license in ci and code-quality, skip scripts elsewhere ([#113](https://github.com/nemchik/biome-plugin-suitescript/issues/113)) ([e303549](https://github.com/nemchik/biome-plugin-suitescript/commit/e303549346fa66949a9eb111dac3b73460d92a32))
* add member gaps so noUnknownModuleMember accepts util.isAsyncFunction ([#75](https://github.com/nemchik/biome-plugin-suitescript/issues/75)) ([#108](https://github.com/nemchik/biome-plugin-suitescript/issues/108)) ([01d9d6a](https://github.com/nemchik/biome-plugin-suitescript/commit/01d9d6a98629e11b8d75eb6ace1d65d9c49589f1))
* **deps:** update dependency oxc-parser to ^0.158.0 ([#121](https://github.com/nemchik/biome-plugin-suitescript/issues/121)) ([b38142a](https://github.com/nemchik/biome-plugin-suitescript/commit/b38142a2077e3d4f905ba576aa6d668cbf33fddd))
* hash the skills with LF endings on every platform ([#117](https://github.com/nemchik/biome-plugin-suitescript/issues/117)) ([02591c6](https://github.com/nemchik/biome-plugin-suitescript/commit/02591c6487a941c50abc2f688b95315caacf5446))
* stop the skills sync writing agent/skills on CI ([#115](https://github.com/nemchik/biome-plugin-suitescript/issues/115)) ([9574498](https://github.com/nemchik/biome-plugin-suitescript/commit/9574498c1ee98445447f059e40fbbb8beaf5f4c6))
* use ast(..., { semantic: true }) for Biome 2.6.7 ([#132](https://github.com/nemchik/biome-plugin-suitescript/issues/132)) ([d38083d](https://github.com/nemchik/biome-plugin-suitescript/commit/d38083d534b33ffec1bfc4a8b0d865bf45e79d7f))

## [0.6.0](https://github.com/nemchik/biome-plugin-suitescript/compare/biome-plugin-suitescript-v0.5.0...biome-plugin-suitescript-v0.6.0) (2026-11-08)


### Features

* add noServerConsole rule ([#65](https://github.com/nemchik/biome-plugin-suitescript/issues/65)) ([ea2e14d](https://github.com/nemchik/biome-plugin-suitescript/commit/ea2e14d3afaecf6e4d3e50b3c415e1110ac89aab))
* add preferUtil rules and a requireUtilModule / noUtilModule pair ([#77](https://github.com/nemchik/biome-plugin-suitescript/issues/77)) ([6b07505](https://github.com/nemchik/biome-plugin-suitescript/commit/6b07505d67bfaa26739ddd36e6b9a598589f433f))
* run verification probes in a sandbox through a RESTlet runner ([#78](https://github.com/nemchik/biome-plugin-suitescript/issues/78)) ([76e889b](https://github.com/nemchik/biome-plugin-suitescript/commit/76e889be8afc14c89c6c0ac232c67609018fac2d))


### Bug Fixes

* **deps:** update dependency oxc-parser to ^0.157.0 ([#84](https://github.com/nemchik/biome-plugin-suitescript/issues/84)) ([64af138](https://github.com/nemchik/biome-plugin-suitescript/commit/64af13822e86cec733a005852a755bbe75dec9e0))

## [0.5.0](https://github.com/nemchik/biome-plugin-suitescript/compare/biome-plugin-suitescript-v0.4.0...biome-plugin-suitescript-v0.5.0) (2026-11-04)


### Features

* add a rule scaffold (npm run new-rule) ([#51](https://github.com/nemchik/biome-plugin-suitescript/issues/51)) ([fc04994](https://github.com/nemchik/biome-plugin-suitescript/commit/fc049949f8ad51a3bc77468d53f238c57f76e14b))

## [0.4.0](https://github.com/nemchik/biome-plugin-suitescript/compare/biome-plugin-suitescript-v0.3.0...biome-plugin-suitescript-v0.4.0) (2026-11-04)


### Features

* add Oracle's and Matt Pocock's agent skills to the repo ([#36](https://github.com/nemchik/biome-plugin-suitescript/issues/36)) ([1f62141](https://github.com/nemchik/biome-plugin-suitescript/commit/1f62141d1a82e5d7ba57db2c0ce524276fca0f2c))

## [0.3.0](https://github.com/nemchik/biome-plugin-suitescript/compare/biome-plugin-suitescript-v0.2.0...biome-plugin-suitescript-v0.3.0) (2026-11-03)


### Features

* add native Biome configs and rules from a full read of Oracle's sources ([#21](https://github.com/nemchik/biome-plugin-suitescript/issues/21)) ([40d0243](https://github.com/nemchik/biome-plugin-suitescript/commit/40d024384e6483c238ec5f8692ea67d733e465c7))
* add rules generated from the type definitions for plain JavaScript projects ([#32](https://github.com/nemchik/biome-plugin-suitescript/issues/32)) ([8b147b3](https://github.com/nemchik/biome-plugin-suitescript/commit/8b147b3d32ba1ef72f84982cce60524b1c71f881))

## [0.2.0](https://github.com/nemchik/biome-plugin-suitescript/compare/biome-plugin-suitescript-v0.1.1...biome-plugin-suitescript-v0.2.0) (2026-11-02)


### Features

* add rules drawn from Oracle's agent skills ([#12](https://github.com/nemchik/biome-plugin-suitescript/issues/12)) ([07dd1ca](https://github.com/nemchik/biome-plugin-suitescript/commit/07dd1ca92acac22d73fbb6446595fc81f4a4929f))
* add rules drawn from Oracle's script type and module pages ([#16](https://github.com/nemchik/biome-plugin-suitescript/issues/16)) ([a0c46c2](https://github.com/nemchik/biome-plugin-suitescript/commit/a0c46c2f9eee6e04adf35f66f0c9d88a5c5b452e))
* add rules drawn from Oracle's SuiteScript documentation ([#14](https://github.com/nemchik/biome-plugin-suitescript/issues/14)) ([adbfde2](https://github.com/nemchik/biome-plugin-suitescript/commit/adbfde2b44afd5ea7a01789d778af12d6b7dc62c))
* add the opt-in noHardcodedSecrets rule ([#15](https://github.com/nemchik/biome-plugin-suitescript/issues/15)) ([d36a5ee](https://github.com/nemchik/biome-plugin-suitescript/commit/d36a5ee22671459f421c032aaec76551195c362f))

## [0.1.1](https://github.com/nemchik/biome-plugin-suitescript/compare/biome-plugin-suitescript-v0.1.0...biome-plugin-suitescript-v0.1.1) (2026-11-02)


### Bug Fixes

* correct the package description to SuiteScript 2.1 ([#9](https://github.com/nemchik/biome-plugin-suitescript/issues/9)) ([3572dbe](https://github.com/nemchik/biome-plugin-suitescript/commit/3572dbe7ae1913e801baf3b6156cb4c22a7501e3))

## 0.1.0 (2026-11-02)


### Features

* add SuiteScript Biome plugins, tag checker CLI and tooling ([#1](https://github.com/nemchik/biome-plugin-suitescript/issues/1)) ([9222ca6](https://github.com/nemchik/biome-plugin-suitescript/commit/9222ca643c2b6951c59ec589d72c3ca633a4c0f5))
