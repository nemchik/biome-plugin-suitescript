import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { isStaticString } from "../lib/suitescript.ts";

// Matches query.runSuiteQL, runSuiteQLPaged and their .promise forms.
const SUITEQL = /(^|\.)runSuiteQL(Paged)?(\.promise)?$/;

// Building SuiteQL from variables invites injection and defeats query plan
// caching; pass values through `params` placeholders instead. A bare variable
// is not flagged because its contents are unknown.
export const noDynamicSuiteQL = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!SUITEQL.test(node.callee?.text ?? "")) return;
    let sql = node.arguments?.children()[0]?.children()[0];
    if (sql?.kind === "JS_OBJECT_EXPRESSION") {
      const member = (sql.children()[0]?.children() ?? []).find(
        (m) => m.children()[0]?.text.replace(/^['"]|['"]$/g, "") === "query",
      );
      sql = member?.children()[1];
    }
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
