import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { parseDefine } from "../lib/define.ts";

export const noExtraModules = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const def = parseDefine(node);
    if (!def) return;
    const names = def.elements;
    const params = def.params;
    if (names.length > params.length) {
      for (const extra of names.slice(params.length)) {
        registerDiagnostic(extra, "error", `Excess module name ${extra.text}.`);
      }
    } else if (params.length > names.length) {
      for (const extra of params.slice(names.length)) {
        if (extra)
          registerDiagnostic(
            extra,
            "error",
            `Excess module identifier '${extra.text}'.`,
          );
      }
    }
  },
});
