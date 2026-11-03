import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { headerCall } from "../lib/headers.ts";
import { isStaticString } from "../lib/suitescript.ts";

// Oracle's OWASP skill: "SAFE: use the documented redirect module instead of
// writing raw headers", because an unvalidated value in a response header can
// split the response. LOW CONFIDENCE, so no preset includes it: the value may
// have been validated, and the skill's references still set Location after
// sanitising it.
export const noLocationHeader = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const header = headerCall(node);
    if (
      header?.name === "location" &&
      header.value &&
      !isStaticString(header.value)
    ) {
      registerDiagnostic(
        header.value,
        "warning",
        "Use N/redirect instead of writing a Location header from a variable.",
      );
    }
  },
});
