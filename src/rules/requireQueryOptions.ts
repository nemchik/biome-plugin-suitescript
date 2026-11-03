import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { definedOptions } from "../lib/required-options.ts";

// Oracle (N/query, Query.createColumn and createCondition): "options.fieldId:
// required if options.formula is not used" and "options.type: required if
// options.formula is used"; createCondition's `operator` is required and
// createSort's `column` is required. Only an options object literal without a
// spread is checked.
export const requireQueryOptions = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const callee = node.callee?.text ?? "";
    const method = /(^|\.)(createColumn|createCondition|createSort)$/.exec(
      callee,
    )?.[2];
    if (!method) return;
    const defined = definedOptions(node);
    if (!defined) return;
    const problems: string[] = [];
    if (method === "createSort") {
      if (!defined.has("column")) problems.push("needs the 'column' option");
    } else {
      if (!defined.has("fieldId") && !defined.has("formula"))
        problems.push("needs a 'fieldId' or a 'formula' option");
      if (defined.has("formula") && !defined.has("type"))
        problems.push("needs the 'type' option when it uses 'formula'");
      if (method === "createCondition" && !defined.has("operator"))
        problems.push("needs the 'operator' option");
    }
    for (const problem of problems) {
      registerDiagnostic(node, "error", `${method}() ${problem}.`);
    }
  },
});
