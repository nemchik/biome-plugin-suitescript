# Assume SuiteScript 2.1 only

Oracle is deprecating SuiteScript 1.0, 2.0 and 2.x, and supporting several versions would mean rules, tests and documentation that branch on the version. Every rule, config and document assumes 2.1, and none explains how to override a rule to keep an older version working. The only rules that mention an older version are the ones that flag its leftovers (`noSuiteScript1Api`) or a `@NApiVersion` that is not 2.1 (the tag checker). Where an Oracle source, an ESLint rule or a Biome rule targets an older version, we do not follow it.
