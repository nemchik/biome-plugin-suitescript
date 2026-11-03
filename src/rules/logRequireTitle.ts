import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { hasProperty, logCall } from "../lib/log.ts";

// Tier 0: docs/adr/0002-options-are-separate-rules.md.
export const logRequireTitle = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const info = logCall(node);
    if (!info) return;
    const { firstArg, prop } = info;
    if (
      firstArg.kind === "JS_OBJECT_EXPRESSION" &&
      !hasProperty(firstArg, "title")
    ) {
      registerDiagnostic(
        node,
        "warning",
        `A log title is required with 'log.${prop}'.`,
      );
    }
  },
});
