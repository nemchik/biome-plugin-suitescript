import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";

// Tier 0: docs/adr/0005-guessing-rules-are-in-no-preset.md, docs/adr/0006-log-is-a-global-with-two-opposite-styles.md.
// Opt-in style: use the global `log` instead of loading N/log. Oracle's help
// center says "NetSuite loads the log Object by default for all script types. You
// do not need to load it manually", which is what this rule follows. It is the
// opposite of requireLogModule, so enable only one of them. (The upgrade skill
// says the global exists but loading is recommended, which requireLogModule
// follows; the learning skill says it is not global and loses.) Logging in a client script attached to a form is
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
