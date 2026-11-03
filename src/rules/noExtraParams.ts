import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { parseDefine } from "../lib/define.ts";

// More callback parameters than dependencies: the extra parameters are always
// undefined, which fails when the module uses them. The matching check for
// dependencies without a parameter is noExtraDeps.
export const noExtraParams = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const def = parseDefine(node);
    if (!def) return;
    for (const extra of def.params.slice(def.elements.length)) {
      if (extra)
        registerDiagnostic(
          extra,
          "error",
          `Excess module identifier '${extra.text}'.`,
        );
    }
  },
});
