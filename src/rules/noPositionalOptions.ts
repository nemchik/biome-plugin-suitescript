import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { moduleCall } from "../lib/module-calls.ts";
import { callArguments } from "../lib/options.ts";

const LITERALS = [
  "JS_STRING_LITERAL_EXPRESSION",
  "JS_NUMBER_LITERAL_EXPRESSION",
  "JS_BOOLEAN_LITERAL_EXPRESSION",
  "JS_NULL_LITERAL_EXPRESSION",
  "JS_ARRAY_EXPRESSION",
];

// The type definitions (Tier 2) show that a module-level function takes one
// options object. Passing a literal instead (`record.load('customer', 1)`) leaves
// every required option missing at runtime. Only a literal first argument is
// flagged; a variable may hold the options object.
export const noPositionalOptions = defineRule({
  query: ast("JS_CALL_EXPRESSION", { semantic: true }),
  run(node, { model }) {
    const call = moduleCall(node, model);
    if (!call || call.alternatives === 0) return;
    const first = callArguments(node)[0];
    if (first && LITERALS.includes(first.kind)) {
      registerDiagnostic(
        first,
        "error",
        `${call.callee}() takes an options object, not positional arguments.`,
      );
    }
  },
});
