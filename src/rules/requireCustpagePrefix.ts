import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { optionsObject, propertyValue } from "../lib/options.ts";

// Receiver `context.form` (or `scriptContext.form`) is the form of the page being
// loaded, an existing NetSuite page. Forms made with serverWidget.createForm are
// standalone pages, and Oracle's own samples use unprefixed ids on them.
const ADDERS =
  /\.form\.(addField|addButton|addSublist|addTab|addSubtab|addCredentialField|addSecretKeyField)$/;

// Oracle (N/ui/serverWidget): "When you add a UI object to an existing NetSuite
// page, to minimize the occurrence of field/object name conflicts, the internal ID
// that references the object must be prefixed with custpage." Only a string
// literal `id` is checked.
export const requireCustpagePrefix = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!ADDERS.test(node.callee?.text ?? "")) return;
    const options = optionsObject(node);
    const id = options && propertyValue(options, "id");
    if (
      id?.kind === "JS_STRING_LITERAL_EXPRESSION" &&
      !/^['"]custpage/.test(id.text)
    ) {
      registerDiagnostic(
        id,
        "warning",
        "The id of a UI object added to an existing page must start with 'custpage'.",
      );
    }
  },
});
