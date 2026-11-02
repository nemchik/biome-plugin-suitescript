import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";
import {
  misplacedModule,
  sideOf,
  unsupportedModule,
} from "../lib/module-script-types.ts";
import { inferredTypes } from "../lib/script-side.ts";

// Loading a client-only module in a server script (or the reverse), or a module
// a script type does not support, fails at runtime. The type comes from the
// entry points the module returns, so libraries and uninferable modules are
// never flagged.
export const noWrongScriptTypeModules = defineRule({
  query: ast("JS_CALL_EXPRESSION", "JS_IMPORT"),
  run(node) {
    const deps = dependencies(node);
    if (deps.length === 0) return;
    const types = inferredTypes(node);
    if (!types) return;
    const side = sideOf(types);
    const single = types.length === 1 ? types[0]?.name : undefined;
    for (const { name, nameNode } of deps) {
      const message =
        name &&
        ((side && misplacedModule(side, name)) ||
          (single && unsupportedModule(single, name)));
      if (message && nameNode) registerDiagnostic(nameNode, "error", message);
    }
  },
});
