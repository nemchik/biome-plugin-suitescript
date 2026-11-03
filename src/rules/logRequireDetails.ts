import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { hasProperty, logCall } from "../lib/log.ts";

// Oracle's help center marks log `details` optional on all four log method pages;
// requiring it does not contradict that, it is a house practice from the ESLint
// log-args rules. As the lowest-precedence kind of source it is in `all` only.
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
