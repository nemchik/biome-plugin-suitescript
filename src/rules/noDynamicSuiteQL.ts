import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { optionsObject, propertyValue } from "../lib/options.ts";
import { isStaticString } from "../lib/suitescript.ts";

// Matches query.runSuiteQL, runSuiteQLPaged and their .promise forms.
const SUITEQL = /(^|\.)runSuiteQL(Paged)?(\.promise)?$/;

// Building SuiteQL from variables invites injection and defeats query plan
// caching; pass values through `params` placeholders instead. A bare variable
// is not flagged because its contents are unknown. A call that passes `params`
// is skipped: the OWASP skill's own examples build `IN (${placeholders})` and an
// allowlisted `ORDER BY ${column}` into the text and bind the values through
// `params`.
export const noDynamicSuiteQL = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!SUITEQL.test(node.callee?.text ?? "")) return;
    const options = optionsObject(node);
    if (options && propertyValue(options, "params")) return;
    const sql = options
      ? propertyValue(options, "query")
      : node.arguments?.children()[0]?.children()[0];
    if (
      sql &&
      !isStaticString(sql) &&
      sql.kind !== "JS_IDENTIFIER_EXPRESSION"
    ) {
      registerDiagnostic(
        sql,
        "warning",
        "Build SuiteQL with ? placeholders and params, not string concatenation.",
      );
    }
  },
});
