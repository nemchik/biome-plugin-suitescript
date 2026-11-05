import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { optionsObject, propertyValue } from "../lib/options.ts";

const COLUMN_UNSUPPORTED = new Set([
  "CHECKBOX",
  "DATETIME",
  "DATETIMETZ",
  "FILE",
  "HELP",
  "INLINEHTML",
  "LABEL",
  "MULTISELECT",
  "SELECT",
  "RADIO",
]);

// Oracle (serverWidget.FieldType): "The DATETIME field type is not supported with
// addField methods, you must specify DATETIMETZ." The type definitions
// (N/ui/serverWidget.d.ts) have no DATETIME member in FieldType at all
// (unverified: docs/verification/contradictions.md, C-004). Oracle also
// says "The CHECKBOX, DATETIME,
// DATETIMETZ, FILE, HELP, INLINEHTML, LABEL, MULTISELECT, SELECT, and RADIO field
// types are not supported with List.addColumn(options)." Sublist.addField has its
// own list but needs the receiver's type, so it is not checked.
export const noUnsupportedServerWidgetFieldType = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const method = /\.(addField|addColumn)$/.exec(node.callee?.text ?? "")?.[1];
    if (!method) return;
    const options = optionsObject(node);
    const type = options && propertyValue(options, "type");
    const member = /(^|\.)FieldType\.(\w+)$/.exec(type?.text ?? "")?.[2];
    if (!type || !member) return;
    if (
      (method === "addField" && member === "DATETIME") ||
      (method === "addColumn" && COLUMN_UNSUPPORTED.has(member))
    ) {
      registerDiagnostic(
        type,
        "error",
        method === "addField"
          ? "DATETIME is not supported by addField; use DATETIMETZ."
          : `${member} is not supported by List.addColumn.`,
      );
    }
  },
});
