import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { moduleOfReceiver } from "../lib/module-calls.ts";
import { MODULES } from "../lib/modules.ts";
import { definedOptions } from "../lib/required-options.ts";

// Oracle (N/query, Query.createColumn and createCondition): "options.fieldId:
// required if options.formula is not used" and "options.type: required if
// options.formula is used"; createCondition's `operator` is required and
// createSort's `column` is required. The type definitions (N/query.d.ts) outrank
// the page and give a formula-only condition its own overload without `operator`,
// so `operator` is required only when there is no `formula`. They type `type?` as
// optional with the formula, but their own comment says "Required if options.formula
// is used", which agrees with the page. Only an options object literal without a
// spread is checked. A receiver bound to another module is skipped:
// `search.createColumn({ name })` is N/search, which takes different options. When
// the binding cannot be resolved, a receiver named like another module's
// conventional identifier (`search`) is skipped too.
export const requireQueryOptions = defineRule({
  query: ast("JS_CALL_EXPRESSION", { semantic: true }),
  run(node, { model }) {
    const callee = node.callee?.text ?? "";
    const method = /(^|\.)(createColumn|createCondition|createSort)$/.exec(
      callee,
    )?.[2];
    if (!method) return;
    const receiver = node.callee?.children()[0];
    const module = receiver && moduleOfReceiver(receiver, model);
    if (module && module !== "N/query") return;
    const conventional = Object.entries(MODULES).find(
      ([, identifier]) => identifier === receiver?.text,
    )?.[0];
    if (!module && conventional && conventional !== "N/query") return;
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
      if (
        method === "createCondition" &&
        !defined.has("operator") &&
        !defined.has("formula")
      )
        problems.push("needs the 'operator' option");
    }
    for (const problem of problems) {
      registerDiagnostic(node, "error", `${method}() ${problem}.`);
    }
  },
});
