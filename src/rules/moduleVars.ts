import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";
import { MODULES } from "../lib/modules.ts";

// Conventional identifiers: N/record -> record, N/ui/serverWidget -> serverWidget.
// Use `biome-plugin-suitescript generate module-vars` for a custom mapping.
export const moduleVars = defineRule({
  query: ast("JS_CALL_EXPRESSION", "JS_IMPORT"),
  run(node) {
    for (const { name, param } of dependencies(node)) {
      const expected =
        name && Object.hasOwn(MODULES, name) ? MODULES[name] : undefined;
      if (expected && param && param.text !== expected) {
        registerDiagnostic(
          param,
          "warning",
          `Identifier for ${name} should be '${expected}'.`,
        );
      }
    }
  },
});
