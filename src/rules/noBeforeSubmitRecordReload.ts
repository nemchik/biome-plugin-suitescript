import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { enclosingFunctionNames } from "../lib/script-side.ts";

const RECORD_CALLS = ["record.load", "record.submitFields", "record.delete"];

// Reloading or editing the record being saved from its own beforeSubmit fails
// with "Record has been changed". Only calls whose id is the context's
// newRecord.id are reported; other records are fine.
export const noBeforeSubmitRecordReload = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!RECORD_CALLS.includes(node.callee?.text ?? "")) return;
    const options = node.arguments?.children()[0]?.children()[0];
    if (!options || !/\bid\s*:\s*[\w.]*newRecord\.id\b/.test(options.text))
      return;
    if (!enclosingFunctionNames(node).includes("beforeSubmit")) return;
    registerDiagnostic(
      node,
      "error",
      `${node.callee?.text}() on the record being saved is not allowed in beforeSubmit.`,
    );
  },
});
