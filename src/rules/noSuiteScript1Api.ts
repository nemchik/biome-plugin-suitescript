import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

// SuiteScript 2.1 only: nlapiXxx functions and nlobjXxx objects are 1.0 leftovers.
export const noSuiteScript1Api = defineRule({
  query: ast("JS_REFERENCE_IDENTIFIER"),
  run(node) {
    if (/^(nlapi|nlobj)[A-Z]/.test(node.text)) {
      registerDiagnostic(
        node,
        "error",
        `'${node.text}' is SuiteScript 1.0; use the SuiteScript 2.1 N/ modules.`,
      );
    }
  },
});
