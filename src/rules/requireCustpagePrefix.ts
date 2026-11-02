import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

const ADDERS =
  /\.(addField|addFieldGroup|addSublist|addTab|addSubtab|addButton)$/;

// Oracle: the internal ID of a UI object added to a page "must be prefixed with
// custpage". Only a string literal `id` is checked.
export const requireCustpagePrefix = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!ADDERS.test(node.callee?.text ?? "")) return;
    const options = node.arguments?.children()[0]?.children()[0];
    if (options?.kind !== "JS_OBJECT_EXPRESSION") return;
    for (const member of options.children()[0]?.children() ?? []) {
      const [name, value] = member.children();
      if (
        name?.text === "id" &&
        value?.kind === "JS_STRING_LITERAL_EXPRESSION" &&
        !/^['"]custpage/.test(value.text)
      ) {
        registerDiagnostic(
          value,
          "warning",
          "The id of a UI object must start with 'custpage'.",
        );
      }
    }
  },
});
