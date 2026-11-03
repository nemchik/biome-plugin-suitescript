import {
  defineRule,
  registerDiagnostic,
  semantic,
} from "@biomejs/runtime/plugin";
import { inSuiteScriptModule } from "../lib/suitescript.ts";

// House style, not an Oracle requirement: load N/log when you call log.*.
// Oracle's help center says "NetSuite loads the log Object by default for all
// script types. You do not need to load it manually", so this deliberately
// overrides that Tier 1 statement (the upgrade skill only recommends loading it,
// the learning skill says it is not global). It is the opposite style to
// noLogModule, so enable only one of them.
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
