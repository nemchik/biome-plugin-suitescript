import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

// Oracle: "When you define custom headers, don't include underscores in the name."
export const noHeaderUnderscores = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!/^https\.[a-zA-Z]+(\.promise)?$/.test(node.callee?.text ?? "")) return;
    const options = node.arguments?.children()[0]?.children()[0];
    if (options?.kind !== "JS_OBJECT_EXPRESSION") return;
    for (const member of options.children()[0]?.children() ?? []) {
      const [name, headers] = member.children();
      if (name?.text !== "headers" || headers?.kind !== "JS_OBJECT_EXPRESSION")
        continue;
      for (const header of headers.children()[0]?.children() ?? []) {
        const key = header.children()[0];
        if (key?.text.replace(/^['"]|['"]$/g, "").includes("_")) {
          registerDiagnostic(
            key,
            "warning",
            "Header names must not contain underscores.",
          );
        }
      }
    }
  },
});
