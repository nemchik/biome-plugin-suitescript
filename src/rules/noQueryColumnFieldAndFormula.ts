import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { hasProperty } from "../lib/log.ts";

// Oracle (N/query): a column's `formula` and `fieldId` "cannot be set at the same time."
export const noQueryColumnFieldAndFormula = defineRule({
  query: ast("JS_OBJECT_EXPRESSION"),
  run(node) {
    if (!hasProperty(node, "fieldId") || !hasProperty(node, "formula")) return;
    const inColumn = node.ancestors().some((a) => {
      if (a.kind === "JS_CALL_EXPRESSION")
        return /createColumn$/.test(a.children()[0]?.text ?? "");
      return (
        a.kind === "JS_PROPERTY_OBJECT_MEMBER" &&
        a.children()[0]?.text === "columns"
      );
    });
    if (inColumn) {
      registerDiagnostic(
        node,
        "error",
        "A query column cannot set both fieldId and formula.",
      );
    }
  },
});
