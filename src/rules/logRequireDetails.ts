import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { hasProperty, logCall } from "../lib/log.ts";

// Deliberate override of Oracle's help center, where log `details` is optional on
// all four log method pages. Requiring it is house style (the ESLint log-args
// rule), so it is in `all` only, not `recommended`.
export const logRequireDetails = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const info = logCall(node);
    if (!info) return;
    const { firstArg, args, prop } = info;
    const isObject = firstArg.kind === "JS_OBJECT_EXPRESSION";
    if (
      (isObject && !hasProperty(firstArg, "details")) ||
      (!isObject && args.length === 1)
    ) {
      registerDiagnostic(
        node,
        "warning",
        `Log details are required with 'log.${prop}'.`,
      );
    }
  },
});
