import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

// Oracle: the N/https module "does not allow the HTTP protocol".
export const noInsecureHttpsUrl = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!/^https\.[a-zA-Z]+(\.promise)?$/.test(node.callee?.text ?? "")) return;
    const options = node.arguments?.children()[0]?.children()[0];
    if (options?.kind !== "JS_OBJECT_EXPRESSION") return;
    for (const member of options.children()[0]?.children() ?? []) {
      const [name, value] = member.children();
      if (
        name?.text === "url" &&
        value?.kind === "JS_STRING_LITERAL_EXPRESSION" &&
        /^['"]http:\/\//i.test(value.text)
      ) {
        registerDiagnostic(
          value,
          "error",
          "N/https does not allow http:// URLs.",
        );
      }
    }
  },
});
