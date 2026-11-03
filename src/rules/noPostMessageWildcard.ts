import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { callArguments, stringValue } from "../lib/options.ts";

// Oracle's OWASP skill: "`postMessage` uses specific origin (never `'*'`)".
// Sending with a wildcard target origin lets any website receive the message.
export const noPostMessageWildcard = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!/\.postMessage$/.test(node.callee?.text ?? "")) return;
    const origin = callArguments(node)[1];
    if (stringValue(origin) === "*") {
      registerDiagnostic(
        origin ?? node,
        "warning",
        "Pass postMessage() a specific target origin, never '*'.",
      );
    }
  },
});
