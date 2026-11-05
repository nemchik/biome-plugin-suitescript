import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";

// Tier 0: docs/adr/0005-guessing-rules-are-in-no-preset.md, docs/adr/0006-suitescript-globals-have-two-opposite-loading-styles.md.
// Opt-in style: use the global `util` instead of loading N/util. Oracle's help
// center says "NetSuite loads the util Object ... by default for all script types.
// You do not need to load it manually", which is what this rule follows. It is the
// opposite of requireUtilModule, so enable only one of them. (The upgrade skill
// says the global exists but recommends loading the module for `log`, which
// requireUtilModule extends to `util`.)
export const noUtilModule = defineRule({
  query: ast("JS_CALL_EXPRESSION", "JS_IMPORT"),
  run(node) {
    for (const { nameNode, name } of dependencies(node)) {
      if (nameNode && name === "N/util") {
        registerDiagnostic(
          nameNode,
          "warning",
          "Use global util instead of the N/util module.",
        );
      }
    }
  },
});
