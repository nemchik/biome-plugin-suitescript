// Copies the GritQL rules into dist/ and writes biome-manifest.json and the preset
// configs from the rule files in src/rules. Run after `tsc` (see the `build` script).
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { formatWithBiome } from "./biome.ts";
import { NATIVE_RULES } from "./native-rules.ts";

const root = new URL("../", import.meta.url);
const sourceRules = new URL("src/rules/", root);
const distRules = new URL("dist/rules/", root);

mkdirSync(distRules, { recursive: true });

const rules: Record<string, string>[] = [];
for (const file of readdirSync(sourceRules).sort()) {
  const [name, extension] = file.split(".");
  if (!name) continue;
  if (extension === "grit") {
    copyFileSync(new URL(file, sourceRules), new URL(file, distRules));
    rules.push({ [name]: `./dist/rules/${file}` });
  } else if (extension === "ts") {
    rules.push({ [name]: `./dist/rules/${name}.js` });
  }
}

// Rules go in `recommended` when breaking them fails at runtime or on upload, or
// when an Oracle source states them as a requirement (see docs/rule-priority.md).
// They never fire on libraries. `all` adds the recommendations and house styles.
// Rules in neither list are opt-in: they guess, so a consumer enables them
// knowingly (noLogModule, noHardcodedSecrets and the low-confidence rules).
const recommended = [
  "noAmdName",
  "noExtraDeps",
  "noExtraParams",
  "noInvalidDefine",
  "noInvalidModules",
  "noModuleExtensions",
  "noMultipleDefine",
  "noRequireInsteadOfDefine",
  "noDynamicRequire",
  "moduleVars",
  "logRequireTitle",
  "entryPoints",
  "noMissingModules",
  "noGlobalShadowing",
  "noDynamicSuiteQL",
  "noSuiteScript1Api",
  "noModuleScopeApiCalls",
  "noNativeIterators",
  "noWrongScriptTypeModules",
  "noBrowserGlobals",
  "noInsecureHttpsUrl",
  "noBeforeSubmitRecordReload",
  "noEmptyEntryPoints",
  "requireCustpagePrefix",
  "noHeaderUnderscores",
  "noQueryColumnFieldAndFormula",
  "requireClientValidateReturn",
  "noPostMessageWildcard",
  "noInnerHtml",
  "noWildcardCors",
  "noSuiteQLTypeInSearch",
  "requireEachReturn",
  "noAuthorizationHeaderInInternalRequest",
  "noBlockedResponseHeader",
  "noBlockedHttpsHeader",
  "requireOptions",
  "noPositionalOptions",
  "noUnknownModuleMember",
  "requireServerWidgetOptions",
  "requireQueryOptions",
  "requireServerResponseOptions",
  "noConflictingClientScriptProps",
  "noUnsupportedServerWidgetFieldType",
  "noHardcodedAuthPasswords",
  "noSecretKeyGuidAndSecret",
  "requireOrderByForPagedSuiteQL",
];

const all = [
  ...recommended,
  "logRequireDetails",
  "noUnknownOptions",
  "noInvalidEnumMember",
  "requireLogModule",
  "noRecordInLoop",
  "noMapReduceSearchResults",
  "noClientLog",
  "noServerConsole",
];

const minimal = ["noExtraDeps", "noExtraParams", "noInvalidModules"];

const presets = { all, minimal, recommended };

const manifest = {
  $schema: "./node_modules/@biomejs/biome/manifest_schema.json",
  configs: [
    { suitescript2: "./configs/suitescript2.json" },
    { minimal: "./configs/minimal.json" },
    { recommended: "./configs/recommended.json" },
    { all: "./configs/all.json" },
  ],
  plugins: { presets, rules },
  version: 1,
};

const manifestPath = fileURLToPath(new URL("biome-manifest.json", root));
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
formatWithBiome(manifestPath);

// One config per preset: the plugin preset plus the native rules and SuiteScript
// globals, so a consumer extends a single entry. The define() callback gets one
// parameter per dependency (noExtraParams), so Biome's unused-parameter check
// would fight it.
mkdirSync(new URL("configs/", root), { recursive: true });
for (const name of Object.keys(presets) as (keyof typeof presets)[]) {
  const linter: Record<string, Record<string, string> | string> = {
    correctness: { noUnusedFunctionParameters: "off" },
    preset: "recommended",
  };
  for (const rule of NATIVE_RULES) {
    if (!(rule.presets as readonly string[]).includes(name)) continue;
    let group = linter[rule.group] as Record<string, string> | undefined;
    if (!group) {
      group = {};
      linter[rule.group] = group;
    }
    group[rule.name] = rule.severity;
  }
  const config = {
    javascript: { globals: ["define", "require", "log", "util"] },
    linter: { rules: linter },
    plugins: [`biome-plugin-suitescript/presets/${name}`],
  };
  const path = fileURLToPath(new URL(`configs/${name}.json`, root));
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
  formatWithBiome(path);
}

console.log(`Manifest: ${rules.length} rules`);
