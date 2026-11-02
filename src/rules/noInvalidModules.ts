import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";
import { MODULES } from "../lib/modules.ts";

// Unknown `N/...` modules are almost always typos; custom modules are fine.
export const noInvalidModules = defineRule({
  query: ast("JS_CALL_EXPRESSION", "JS_IMPORT"),
  run(node) {
    for (const { nameNode, name } of dependencies(node)) {
      if (nameNode && name?.startsWith("N/") && !Object.hasOwn(MODULES, name)) {
        registerDiagnostic(
          nameNode,
          "error",
          `Invalid NetSuite module '${name}'.`,
        );
      }
    }
  },
});
