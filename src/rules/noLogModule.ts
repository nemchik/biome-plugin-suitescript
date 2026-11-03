import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";

// Opt-in style: use the global `log` instead of loading N/log. Oracle's help
// center says "NetSuite loads the log Object by default for all script types. You
// do not need to load it manually", which is what this rule follows. It is the
// opposite of requireLogModule, so enable only one of them. (Oracle's skills
// disagree: upgrade says the global exists but importing is recommended; learning
// says it is not global.) Logging in a client script attached to a form is
// ignored either way; see noClientLog.
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
