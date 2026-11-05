// The data behind the README rules table: every rule's description, sources and
// opt-in reason. `scripts/rules-table.ts` turns it into the table. When you add a
// rule, add it here (the build and the README test fail if one is missing).

/** 1 Oracle agent skills, 2 type definitions, 3 Oracle documentation, 4 SuiteScript-specific rules, 5 generic JavaScript rules. */
export type Tier = 1 | 2 | 3 | 4 | 5;

export interface Source {
  tier: Tier;
  /** Link text, for example `Oracle help: N/https` or `` btonasse `no-amd-name` ``. */
  label: string;
  url: string;
  /** Set for rules ported from an ESLint plugin; `scripts/migration-table.ts` reads it. */
  eslint?: { plugin: EslintPlugin; rule: string };
}

export type EslintPlugin =
  | "eslint-plugin-suitescript (acdvs)"
  | "eslint-plugin-suitescript (btonasse)"
  | "eslint-plugin-amd";

export interface RuleInfo {
  description: string;
  sources: Source[];
  /** Why the rule is in no preset (set only for opt-in rules). */
  optIn?: string;
}

const ACDVS =
  "https://github.com/acdvs/eslint-plugin-suitescript/blob/master/lib/rules/";
const BTONASSE =
  "https://github.com/btonasse/eslint-plugin-suitescript/blob/master/lib/rules/";
const AMD = "https://github.com/acdvs/eslint-plugin-amd/blob/main/lib/rules/";
const SKILLS =
  "https://github.com/nemchik/biome-plugin-suitescript/blob/main/.agents/skills/";
const HELP = "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/";
const TYPINGS =
  "https://github.com/headintheclouddev/typings-suitescript-2.0/blob/master/N/";
export const BIOME = "https://biomejs.dev/linter/rules/";
/** Where the generated page for each rule lives (absolute: the README is published to npm, docs/ is not). */
export const RULE_PAGES =
  "https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/rules/";
export const ADR =
  "https://github.com/nemchik/biome-plugin-suitescript/blob/main/docs/adr/";

const acdvs = (name: string): Source => ({
  eslint: { plugin: "eslint-plugin-suitescript (acdvs)", rule: name },
  label: `acdvs \`${name}\``,
  tier: 4,
  url: `${ACDVS}${name}.ts`,
});
const btonasse = (name: string): Source => ({
  eslint: { plugin: "eslint-plugin-suitescript (btonasse)", rule: name },
  label: `btonasse \`${name}\``,
  tier: 4,
  url: `${BTONASSE}${name}.js`,
});
const amd = (name: string): Source => ({
  eslint: { plugin: "eslint-plugin-amd", rule: name },
  label: `amd \`${name}\``,
  tier: 4,
  url: `${AMD}${name}.ts`,
});
const help = (label: string, page: string): Source => ({
  label: `Oracle help: ${label}`,
  tier: 3,
  url: `${HELP}${page}.html`,
});
const typings = (module: string): Source => ({
  label: `headintheclouddev \`N/${module}\``,
  tier: 2,
  url: `${TYPINGS}${module}.d.ts`,
});
const skill = (label: string, name: string, path = "SKILL.md"): Source => ({
  label,
  tier: 1,
  url: `${SKILLS}${name}/${path}`,
});
/** The whole N/ directory, for rules generated from every module's declarations. */
const typingsDirectory = (): Source => ({
  label: "headintheclouddev `N/*`",
  tier: 2,
  url: "https://github.com/headintheclouddev/typings-suitescript-2.0/tree/master/N",
});
const owasp = (label = "OWASP skill", path = "SKILL.md") =>
  skill(label, "netsuite-owasp-secure-coding", path);
const safe = (label = "SAFE guide", path = "SKILL.md") =>
  skill(label, "netsuite-sdf-safe-guide", path);
const upgrade = (label = "upgrade skill", path = "SKILL.md") =>
  skill(label, "netsuite-suitescript-upgrade", path);
const learning = () => skill("learning skill", "netsuite-suitescript-learning");

export const RULES: Record<string, RuleInfo> = {
  entryPoints: {
    description:
      "Returned entry points must belong to one script type and include its required ones",
    sources: [
      help("entry point validation", "chapter_4527904430"),
      help("validation errors", "section_4503568059"),
      acdvs("entry-points"),
      btonasse("entry-points"),
    ],
  },
  logRequireDetails: {
    description:
      "...needs `details` (Oracle marks it optional, so this house style is in `all` only)",
    sources: [acdvs("log-args"), btonasse("log-args")],
  },
  logRequireTitle: {
    description: "`log.debug/audit/error/emergency({...})` needs `title`",
    sources: [
      help("log.debug", "section_4430385329"),
      acdvs("log-args"),
      btonasse("log-args"),
    ],
  },
  moduleVars: {
    description:
      "Conventional identifier per `N/` module (`N/record` → `record`)",
    sources: [acdvs("module-vars"), btonasse("module-vars")],
  },
  noAmdName: {
    description: "No module id as the first `define` argument (fixable)",
    sources: [btonasse("no-amd-name"), amd("no-name")],
  },
  noAuthorizationHeaderInInternalRequest: {
    description:
      "No `Authorization` header in `https.requestRestlet`/`requestSuitelet`/`requestSuiteTalkRest`",
    sources: [
      typings("https"),
      help("https.requestRestlet", "section_159139340774"),
    ],
  },
  noBeforeSubmitRecordReload: {
    description:
      "No `record.load`/`submitFields`/`delete` of `context.newRecord.id` inside `beforeSubmit`",
    sources: [help("script architecture", "subsect_0804042112")],
  },
  noBlockedHttpsHeader: {
    description:
      "No header NetSuite discards from an `https.*` request (`Host`, `Content-Length`, ...)",
    sources: [help("N/https", "section_4418229131")],
  },
  noBlockedResponseHeader: {
    description:
      "No header NetSuite blocks on a Suitelet response (`Location`, `Server`, `Date`, ...)",
    sources: [help("N/https", "section_4418229131")],
  },
  noBrowserGlobals: {
    description:
      "No `document`, `window`, `localStorage`, `XMLHttpRequest`, `alert`, `navigator`, `URLSearchParams` or `fetch` in server scripts",
    sources: [safe(), help("FAQ", "chapter_N3917921")],
  },
  noClientLog: {
    description:
      "`log.*` is ignored in client scripts attached to a form; use `console`",
    sources: [help("N/log", "section_4574548135")],
  },
  noConflictingClientScriptProps: {
    description:
      "Do not set both `clientScriptFileId` and `clientScriptModulePath` on a form",
    sources: [help("Form.clientScriptModulePath", "section_4625445350")],
  },
  noDynamicRequire: {
    description:
      "`require()` takes string literal module names, not expressions",
    sources: [owasp(), amd("no-dynamic-require")],
  },
  noDynamicSuiteQL: {
    description:
      "`runSuiteQL` queries use `?` placeholders, not concatenation or template literals (calls that pass `params` are skipped)",
    sources: [owasp()],
  },
  noEmptyEntryPoints: {
    description: "A returned entry point with an empty body",
    sources: [help("script architecture", "subsect_0804042112")],
  },
  noExtraDeps: {
    description:
      "More dependencies than callback parameters (the extra modules load but are unused)",
    sources: [btonasse("no-extra-modules"), amd("no-extra-deps")],
  },
  noExtraParams: {
    description:
      "More callback parameters than dependencies (the extra parameters are always `undefined`)",
    sources: [btonasse("no-extra-modules"), amd("no-extra-params")],
  },
  noGlobalShadowing: {
    description:
      "No variable named `log` or `util` other than the N/log, N/util module itself",
    sources: [upgrade()],
  },
  noHardcodedAuthPasswords: {
    description:
      "No string literal passed as a password to `auth.changePassword`/`changeEmail`",
    sources: [
      help("security considerations", "chapter_159804448843"),
      help("auth.changePassword", "section_4298157647"),
    ],
  },
  noHardcodedSecrets: {
    description:
      "No string literal assigned to `password`, `secret`, `apiKey`, ...",
    optIn: "it guesses from names, so it can misfire on look-alike names",
    sources: [owasp(), help("security considerations", "chapter_159804448843")],
  },
  noHeaderUnderscores: {
    description: "No underscore in a custom `https.*` header name",
    sources: [help("N/https", "section_4418229131")],
  },
  noInnerHtml: {
    description:
      "No non-static value assigned to `innerHTML`/`outerHTML` or passed to `insertAdjacentHTML`/`document.write` (client scripts)",
    sources: [owasp()],
  },
  noInsecureCookie: {
    description:
      "A literal `Set-Cookie` value has `HttpOnly`, `Secure` and `SameSite`",
    optIn:
      "only literal values are checked, and we have not confirmed a Suitelet may set `Set-Cookie`",
    sources: [owasp()],
  },
  noInsecureHttpsUrl: {
    description:
      "No `http://` URL passed to `https.*` (N/https refuses plain HTTP)",
    sources: [help("N/https", "section_4418229131")],
  },
  noInvalidDefine: {
    description:
      "`define()` has one of the valid AMD shapes (a function or object factory, an optional name and dependency array)",
    sources: [amd("no-invalid-define")],
  },
  noInvalidEnumMember: {
    description:
      "A member of a module enum (`record.Type.CUSTOMR`) is one the type definitions list",
    sources: [typingsDirectory()],
  },
  noInvalidModules: {
    description: "Unknown `N/...` modules",
    sources: [acdvs("no-invalid-modules"), btonasse("no-invalid-modules")],
  },
  noLocationHeader: {
    description: "No `Location` header built from a variable; use `N/redirect`",
    optIn:
      "the value may already be validated, and the skill's references still set `Location` after sanitising it",
    sources: [owasp()],
  },
  noLogModule: {
    description:
      "Opt-in style: use the global `log`, not `N/log` (the opposite of `requireLogModule`)",
    optIn: "the opposite style to `requireLogModule`; enable only one",
    sources: [
      help("log object", "section_4387812838"),
      acdvs("no-log-module"),
      btonasse("no-log-module"),
    ],
  },
  noMapReduceSearchResults: {
    description:
      "`getInputData` returns the search object, not `getRange()` results",
    sources: [help("map/reduce best practices", "section_0801064715")],
  },
  noMissingModules: {
    description:
      "A module used (`record.load()`) must be loaded in `define`/`import` (`log` and `util` are globals)",
    sources: [upgrade(), learning()],
  },
  noModuleExtensions: {
    description: "No `.js` in `define` dependency names (fixable)",
    sources: [btonasse("no-module-extensions"), amd("no-module-extensions")],
  },
  noModuleScopeApiCalls: {
    description:
      "No `N/` API calls while the `define` callback runs; initialize from entry points (calls that only build an object, `createColumn`, `createFilter`, `createSort` and `createSetting`, are skipped)",
    sources: [safe()],
  },
  noMultipleDefine: {
    description: "A script calls `define()` only once",
    sources: [
      help("entry point validation", "chapter_4527904430"),
      help("validation errors", "section_4503568059"),
    ],
  },
  noNativeIterators: {
    description: "No generator functions or `Symbol.iterator` (GraalJS)",
    sources: [safe()],
  },
  noPositionalOptions: {
    description:
      "No literal passed where a module function takes an options object (`record.load('customer', 1)`)",
    sources: [typingsDirectory()],
  },
  noPostMessageWildcard: {
    description: "No `'*'` target origin in `postMessage`",
    sources: [owasp()],
  },
  noPublicFileUpload: {
    description: "No `isOnline: true` (public file)",
    optIn: "public assets legitimately set `isOnline`",
    sources: [
      owasp(
        "OWASP skill: file upload",
        "references/07-file-upload-download.md",
      ),
    ],
  },
  noQueryColumnFieldAndFormula: {
    description: "A query column cannot set both `fieldId` and `formula`",
    sources: [
      help("Column.fieldId", "section_1510788976"),
      help("Column.formula", "section_1510789062"),
    ],
  },
  noRecordInLoop: {
    description:
      "No `record.load`, `query.runSuiteQL` or `search.create` inside loops or `forEach`/`each`/`map` callbacks",
    sources: [safe()],
  },
  noRequireInsteadOfDefine: {
    description:
      "A script uses `define()`, not a top-level `require([...], cb)`",
    sources: [help("invalid script example", "section_4527901694")],
  },
  noSecretKeyGuidAndSecret: {
    description: "`https.createSecretKey` takes `guid` or `secret`, not both",
    sources: [
      typings("https"),
      help("https.createSecretKey", "section_4418247967"),
    ],
  },
  noSensitiveBrowserStorage: {
    description:
      "No token- or password-named key in `localStorage`/`sessionStorage.setItem`",
    optIn: "it guesses from the key name",
    sources: [owasp()],
  },
  noServerConsole: {
    description:
      "`console` output goes nowhere in server scripts; use `log.*` (`console` is for client scripts, so Biome's native `noConsole`, which cannot tell them apart, does not fit alongside this rule)",
    sources: [safe("SAFE guide", "quick-reference.md")],
  },
  noStackInResponse: {
    description: "No `.stack` inside `response.write`/`writeLine` arguments",
    optIn:
      "a stack returned from a RESTlet is not detected, and the skill's own logging example includes `e.stack`",
    sources: [owasp()],
  },
  noSuiteQLSelectStar: {
    description: "No `SELECT *` in a literal SuiteQL query",
    optIn:
      "the guide itself recommends a `SELECT * ... ROWNUM <= 1` probe, and only literal queries are seen",
    sources: [
      safe(
        "SAFE guide: performance",
        "references/03-performance-optimization.md",
      ),
    ],
  },
  noSuiteQLSystemNoteJoin: {
    description: "No `JOIN SystemNote` in a literal SuiteQL query",
    optIn: "a tightly filtered join is fine, and only literal queries are seen",
    sources: [safe()],
  },
  noSuiteQLTypeInSearch: {
    description:
      "No SuiteQL abbreviation (`PurchOrd`) as the `type` of `search.create`",
    sources: [safe()],
  },
  noSuiteScript1Api: {
    description:
      "No `nlapi*`/`nlobj*` or 1.0-only methods (`getFieldValue`, `getLineItemValue`, `e.getCode()`)",
    sources: [upgrade()],
  },
  noUnknownModuleMember: {
    description:
      "Only members the type definitions export are read from an `N/` module (`record.loadRecord` is not one)",
    sources: [typingsDirectory()],
  },
  noUnknownOptions: {
    description:
      "No option the type definitions do not list for a module function (`record.load({ typ: 'x' })`)",
    sources: [typingsDirectory()],
  },
  noUnsupportedServerWidgetFieldType: {
    description:
      "No `DATETIME` in `addField` and no unsupported type in `List.addColumn`",
    sources: [
      typings("ui/serverWidget"),
      help("serverWidget.FieldType", "section_4332671056"),
    ],
  },
  noWeakHash: {
    description: "No `HashAlg.MD5` or `HashAlg.SHA1`",
    optIn:
      "it cannot tell a security use from a vendor integration that requires MD5 or SHA-1, and the type definitions list only `SHA256` and `SHA512` for `crypto.HashAlg`, so the member names come from the skill alone",
    sources: [owasp()],
  },
  noWildcardCors: {
    description: "No `Access-Control-Allow-Origin: *` response header",
    sources: [owasp()],
  },
  noWrongScriptTypeModules: {
    description:
      "No client-only module (`N/currentRecord`, `N/ui/dialog`) in a server script, or a server-only one in a client script",
    sources: [help("SuiteScript 2.1 modules", "chapter_4220488571")],
  },
  requireClientValidateReturn: {
    description:
      "`saveRecord` and `validate*` return a value (only a body with no `return <value>` is flagged)",
    sources: [
      help("saveRecord", "section_4410693749"),
      help("validateField", "section_4410693152"),
    ],
  },
  requireCustpagePrefix: {
    description:
      "The `id` of a UI object added to an existing page (`context.form.addField`, ...) starts with `custpage`",
    sources: [help("N/ui/serverWidget", "section_4321345532")],
  },
  requireEachReturn: {
    description:
      "A `.run().each` or `.iterator().each` callback returns a value (`true` to continue)",
    sources: [upgrade(), learning()],
  },
  requireLogModule: {
    description:
      "A used `log.*` needs `N/log` loaded (the upgrade skill recommends it; the global needs no loading)",
    sources: [upgrade(), learning()],
  },
  requireOptions: {
    description:
      "Every required option of a module function (`record.load`, `search.create`, `email.send`, ...) is present",
    sources: [typingsDirectory()],
  },
  requireOrderByForPagedSuiteQL: {
    description: "A literal `runSuiteQLPaged` query has an `ORDER BY`",
    sources: [help("query.runSuiteQLPaged", "section_157960586441")],
  },
  requireQueryOptions: {
    description:
      "Required `createColumn`/`createCondition`/`createSort` options (`fieldId` or `formula`, `type` with `formula`, ...) are present",
    sources: [
      typings("query"),
      help("Query.createColumn", "section_1510780373"),
    ],
  },
  requireServerResponseOptions: {
    description:
      "Required `response.setHeader`/`write`/`writeFile`/... options are present",
    sources: [typings("http"), help("ServerResponse", "section_4567652689")],
  },
  requireServerWidgetOptions: {
    description:
      "Required `addField`/`addButton`/`addSublist`/`addColumn`/... options (`id`, `label`, `type`, ...) are present",
    sources: [
      typings("ui/serverWidget"),
      help("N/ui/serverWidget", "section_4321345532"),
    ],
  },
};

/** Rules shaped by a Tier 0 decision (an ADR in docs/adr), by rule name. */
export const TIER_ZERO: Record<string, string[]> = {
  logRequireDetails: ["0002-options-are-separate-rules"],
  logRequireTitle: ["0002-options-are-separate-rules"],
  noHardcodedSecrets: ["0005-guessing-rules-are-in-no-preset"],
  noInsecureCookie: ["0005-guessing-rules-are-in-no-preset"],
  noLocationHeader: ["0005-guessing-rules-are-in-no-preset"],
  noLogModule: [
    "0005-guessing-rules-are-in-no-preset",
    "0006-suitescript-globals-have-two-opposite-loading-styles",
  ],
  noMissingModules: [
    "0006-suitescript-globals-have-two-opposite-loading-styles",
  ],
  noPublicFileUpload: ["0005-guessing-rules-are-in-no-preset"],
  noSensitiveBrowserStorage: ["0005-guessing-rules-are-in-no-preset"],
  noStackInResponse: ["0005-guessing-rules-are-in-no-preset"],
  noSuiteQLSelectStar: ["0005-guessing-rules-are-in-no-preset"],
  noSuiteQLSystemNoteJoin: ["0005-guessing-rules-are-in-no-preset"],
  noWeakHash: ["0005-guessing-rules-are-in-no-preset"],
  requireLogModule: [
    "0006-suitescript-globals-have-two-opposite-loading-styles",
  ],
};

/** Descriptions and Biome documentation slugs for the native rules in `NATIVE_RULES`. */
export const NATIVE_INFO: Record<
  string,
  { description: string; slug: string }
> = {
  noGlobalEval: {
    description: 'No `eval()` (Oracle\'s OWASP skill: "Never use `eval`")',
    slug: "no-global-eval",
  },
  noImpliedEval: {
    description:
      "No `new Function()` or string-form `setTimeout`/`setInterval` (OWASP skill)",
    slug: "no-implied-eval",
  },
  noVar: {
    description:
      'Use `const`/`let`, not `var` (upgrade skill: "Modernize JavaScript")',
    slug: "no-var",
  },
  useConst: {
    description: "Use `const` for never-reassigned bindings (upgrade skill)",
    slug: "use-const",
  },
  useForOf: {
    description:
      "Use `for...of` where the index is only used to read (upgrade skill)",
    slug: "use-for-of",
  },
  useIncludes: {
    description:
      "Use `includes`, not `indexOf` (upgrade skill; needs type information, so it may report nothing)",
    slug: "use-includes",
  },
  useTemplate: {
    description:
      "Use template literals, not string concatenation (upgrade skill)",
    slug: "use-template",
  },
};
