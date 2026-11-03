import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { callArguments } from "../lib/options.ts";

// Oracle's OWASP skill: "Hardcode module paths; never build from input."
// A module name passed to require() must be a string literal, alone or in an
// array of them.
export const noDynamicRequire = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (node.callee?.text !== "require") return;
    const first = callArguments(node)[0];
    if (!first) return;
    const names =
      first.kind === "JS_ARRAY_EXPRESSION"
        ? (first.children()[0]?.children() ?? [])
        : [first];
    for (const name of names) {
      if (name.kind !== "JS_STRING_LITERAL_EXPRESSION") {
        registerDiagnostic(
          name,
          "warning",
          "Pass require() a string literal module name, not an expression.",
        );
      }
    }
  },
});
