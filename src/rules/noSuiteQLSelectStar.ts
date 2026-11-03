import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { SUITEQL, staticSuiteql } from "../lib/suiteql.ts";

// Tier 0: docs/adr/0005-guessing-rules-are-in-no-preset.md.
// Oracle's SAFE guide: "Avoid SELECT *" and "Always specify needed columns."
// LOW CONFIDENCE, so no preset includes it: the guide itself recommends a
// `SELECT * ... WHERE ROWNUM <= 1` probe to discover column names, and the rule
// only sees a query built from literals.
export const noSuiteQLSelectStar = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!SUITEQL.test(node.callee?.text ?? "")) return;
    const sql = staticSuiteql(node);
    if (sql && /\bSELECT\s+(DISTINCT\s+)?\*/i.test(sql)) {
      registerDiagnostic(
        node,
        "warning",
        "Name the columns instead of SELECT *.",
      );
    }
  },
});
