import {
  defineRule,
  registerDiagnostic,
  semantic,
} from "@biomejs/runtime/plugin";
import { inSuiteScriptModule } from "../lib/suitescript.ts";

// Tier 0: docs/adr/0006-suitescript-globals-have-two-opposite-loading-styles.md.
// Load N/log when you call log.*. Oracle's upgrade skill says `log` is global but
// "explicitly including it in `define()` makes dependencies clearer and is
// recommended", and that practice is what this rule enforces. The help center's
// "NetSuite loads the log Object by default for all script types. You do not need
// to load it manually" is why noMissingModules leaves `log` alone. The learning
// skill's "not globally available" loses: the documentation and the higher-ranked
// upgrade skill both say it is global. This is the opposite style to noLogModule,
// so enable only one of them.
export const requireLogModule = defineRule({
  query: semantic("JS_REFERENCE_IDENTIFIER"),
  run(node, { model }) {
    if (node.text !== "log" || model.binding(node)) return;
    const member = node.parent?.parent;
    if (
      member?.kind !== "JS_STATIC_MEMBER_EXPRESSION" ||
      member.children()[0]?.text !== "log"
    )
      return;
    if (!inSuiteScriptModule(node)) return;
    registerDiagnostic(
      node,
      "warning",
      "'log' is used but N/log is not loaded.",
    );
  },
});
