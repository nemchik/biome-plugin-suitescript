import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { definedOptions } from "../lib/required-options.ts";

// Oracle (https.createSecretKey): "You cannot use both the options.guid parameter
// and secret parameter in combination." The type definitions (N/https.d.ts) carry
// the same comment and make both options optional. The documentation's sample
// uses an option its method page does not list: docs/verification/contradictions.md, C-006
// (unverified).
export const noSecretKeyGuidAndSecret = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!/^https\.createSecretKey(\.promise)?$/.test(node.callee?.text ?? ""))
      return;
    const defined = definedOptions(node);
    if (defined?.has("guid") && defined.has("secret")) {
      registerDiagnostic(
        node,
        "error",
        "Pass createSecretKey() either 'guid' or 'secret', not both.",
      );
    }
  },
});
