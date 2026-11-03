import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { descendants } from "../lib/script-side.ts";

// Oracle's OWASP skill: "Returning stack traces, internal IDs, script file paths,
// or record structure details in error responses gives attackers a map of the
// system." LOW CONFIDENCE, so no preset includes it: only a `.stack` read inside
// the arguments of `response.write`/`writeLine` is detected, not one returned from
// a RESTlet.
export const noStackInResponse = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!/response\.(write|writeLine)$/i.test(node.callee?.text ?? "")) return;
    for (const child of descendants(node)) {
      if (
        child.kind === "JS_STATIC_MEMBER_EXPRESSION" &&
        child.children()[1]?.text === "stack"
      ) {
        registerDiagnostic(
          child,
          "warning",
          "Do not send a stack trace to the client.",
        );
      }
    }
  },
});
