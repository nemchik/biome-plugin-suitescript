import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { staticSuiteql } from "../lib/suiteql.ts";

// Oracle (query.runSuiteQLPaged): "You must specify a sorting order in the query
// definition when using this method to avoid duplicate or missing results. The
// query definition must provide a unique and unambiguous sorting order with a
// specified precedence." Only a query built from literals can be checked.
export const requireOrderByForPagedSuiteQL = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!/(^|\.)runSuiteQLPaged(\.promise)?$/.test(node.callee?.text ?? ""))
      return;
    const sql = staticSuiteql(node);
    if (sql && !/\bORDER\s+BY\b/i.test(sql)) {
      registerDiagnostic(
        node,
        "warning",
        "A paged SuiteQL query needs an ORDER BY to avoid duplicate or missing results.",
      );
    }
  },
});
