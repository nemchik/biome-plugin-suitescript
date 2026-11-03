import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { SUITEQL, staticSuiteql } from "../lib/suiteql.ts";

// Oracle's SAFE guide: "`SystemNote` is an extremely high-volume table ... Joining
// it in SuiteQL queries causes severe performance degradation and frequent query
// timeouts", "never as a JOIN against a large result set". LOW CONFIDENCE, so no
// preset includes it: a tightly filtered join is fine, and the rule only sees a
// query built from literals.
export const noSuiteQLSystemNoteJoin = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!SUITEQL.test(node.callee?.text ?? "")) return;
    const sql = staticSuiteql(node);
    if (sql && /\b(JOIN\s+|,\s*)SystemNote\b/i.test(sql)) {
      registerDiagnostic(
        node,
        "warning",
        "Do not join SystemNote in a SuiteQL query; query it separately with filters.",
      );
    }
  },
});
