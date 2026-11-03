import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { moduleCall } from "../lib/module-calls.ts";
import { definedOptions } from "../lib/required-options.ts";

// The type definitions (Tier 2) say which options each module-level function
// requires, and a missing one makes the call fail at runtime (Oracle's method
// pages list it as SSS_MISSING_REQD_ARGUMENT). The receiver is resolved from the
// define() or import binding, so `record.load` is checked only when `record` is
// N/record. Only an options object literal without a spread is checked, and a
// function with several call shapes passes when any shape is satisfied.
export const requireOptions = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const call = moduleCall(node);
    if (!call || call.alternatives === 0) return;
    const defined = definedOptions(node);
    if (!defined) return;
    const missing = call.alternatives
      .map(([required]) => required.filter((name) => !defined.has(name)))
      .sort((a, b) => a.length - b.length)[0];
    for (const name of missing ?? []) {
      registerDiagnostic(
        node,
        "error",
        `${call.callee}() needs the '${name}' option.`,
      );
    }
  },
});
