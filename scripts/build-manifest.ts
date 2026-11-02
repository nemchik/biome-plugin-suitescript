// Copies the GritQL rules into dist/ and writes biome-manifest.json from the
// rule files in src/rules. Run after `tsc` (see the `build` script).
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { formatWithBiome } from "./biome.ts";

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

// Presets only hold rules that never fire on libraries or client scripts.
const recommended = [
  "noAmdName",
  "noExtraModules",
  "noInvalidModules",
  "noModuleExtensions",
  "moduleVars",
  "logRequireTitle",
  "logRequireDetails",
  "noMissingModules",
  "noGlobalShadowing",
  "noEval",
  "noDynamicSuiteQL",
  "noSuiteScript1Api",
  "noModuleScopeApiCalls",
  "noWrongScriptTypeModules",
  "noBrowserGlobals",
];

const manifest = {
  $schema: "./node_modules/@biomejs/biome/manifest_schema.json",
  configs: [{ suitescript2: "./configs/suitescript2.json" }],
  plugins: {
    presets: {
      // noLogModule is the opposite style to noMissingModules, so `all` omits it.
      all: [
        ...recommended,
        "entryPoints",
        "noRecordInLoop",
        "noNativeIterators",
        "noBeforeSubmitRecordReload",
        "noEmptyEntryPoints",
        "noMapReduceSearchResults",
      ],
      minimal: ["noExtraModules", "noInvalidModules"],
      recommended,
    },
    rules,
  },
  version: 1,
};

const manifestPath = fileURLToPath(new URL("biome-manifest.json", root));
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
formatWithBiome(manifestPath);
console.log(`Manifest: ${rules.length} rules`);
