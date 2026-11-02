import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";

// Opt-in style: use the global `log` instead of loading N/log. It is the opposite
// of noMissingModules, which requires loading N/log, so enable only one of them.
// Oracle's skills disagree on this (upgrade: the global exists but importing is
// recommended; learning: it is not global). The global is not available in
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
