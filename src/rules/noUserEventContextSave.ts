import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

// Oracle: "You can't use record.Record.save() here" for the newRecord and
// oldRecord of a user event context; load the record to change it instead.
export const noUserEventContextSave = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const callee = node.callee?.text ?? "";
    if (/(^|\.)(newRecord|oldRecord)\.save$/.test(callee)) {
      registerDiagnostic(
        node,
        "error",
        `${callee}() is not allowed; the context record is read-only.`,
      );
    }
  },
});
