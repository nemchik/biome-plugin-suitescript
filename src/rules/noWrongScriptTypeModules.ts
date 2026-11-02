import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";
import { misplacedModule } from "../lib/module-script-types.ts";
import { scriptSide } from "../lib/script-side.ts";

// Loading a client-only module in a server script (or the reverse) fails at
// runtime. The side comes from the entry points the module returns, so
// libraries and uninferable modules are never flagged.
export const noWrongScriptTypeModules = defineRule({
  query: ast("JS_CALL_EXPRESSION", "JS_IMPORT"),
  run(node) {
    const deps = dependencies(node);
    if (deps.length === 0) return;
    const side = scriptSide(node);
    if (!side) return;
    for (const { name, nameNode } of deps) {
      const message = name && misplacedModule(side, name);
      if (message && nameNode) registerDiagnostic(nameNode, "error", message);
    }
  },
});
