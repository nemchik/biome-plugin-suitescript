import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { parseDefine } from "../lib/define.ts";

// More dependencies than callback parameters: the extra modules load but cannot
// be used. NetSuite does not fail on it, so this is a warning. The matching
// check for parameters without a dependency is noExtraParams.
export const noExtraDeps = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const def = parseDefine(node);
    if (!def) return;
    for (const extra of def.elements.slice(def.params.length)) {
      registerDiagnostic(extra, "warning", `Excess module name ${extra.text}.`);
    }
  },
});
