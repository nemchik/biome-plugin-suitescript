import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { logCall } from "../lib/log.ts";
import { scriptSide } from "../lib/script-side.ts";

// Oracle (N/log): in a client script attached to a form, "calls to any log
// function ... are ignored". It cannot tell whether a form is attached.
export const noClientLog = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const info = logCall(node);
    if (!info || scriptSide(node) !== "client") return;
    registerDiagnostic(
      node,
      "warning",
      `log.${info.prop}() is ignored in client scripts attached to a form; use console.`,
    );
  },
});
