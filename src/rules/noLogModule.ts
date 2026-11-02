import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";

// Use the global `log` instead of loading N/log. The global is not available in
// client scripts, so scope this rule away from them with the plugin `includes`.
export const noLogModule = defineRule({
  query: ast("JS_CALL_EXPRESSION", "JS_IMPORT"),
  run(node) {
    for (const { nameNode, name } of dependencies(node)) {
      if (nameNode && name === "N/log") {
        registerDiagnostic(
          nameNode,
          "warning",
          "Use global log instead of the N/log module.",
        );
      }
    }
  },
});
