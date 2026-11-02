import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

const TIMERS = ["setTimeout", "setInterval"];

// eval(), new Function() and string-form timers run arbitrary code.
export const noEval = defineRule({
  query: ast("JS_CALL_EXPRESSION", "JS_NEW_EXPRESSION"),
  run(node) {
    const callee = node.callee?.text;
    if (!callee) return;
    if (callee === "eval" || callee === "Function") {
      registerDiagnostic(node, "error", `Do not use ${callee}().`);
    } else if (node.kind === "JS_CALL_EXPRESSION" && TIMERS.includes(callee)) {
      const first = node.arguments?.children()[0]?.children()[0];
      if (
        first?.kind === "JS_STRING_LITERAL_EXPRESSION" ||
        first?.kind === "JS_TEMPLATE_EXPRESSION"
      ) {
        registerDiagnostic(
          node,
          "error",
          `Do not pass a string to ${callee}(); it is evaluated as code.`,
        );
      }
    }
  },
});
