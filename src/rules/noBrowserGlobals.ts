import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { scriptSide } from "../lib/script-side.ts";

const BROWSER_GLOBALS = new Set([
  "document",
  "window",
  "localStorage",
  "sessionStorage",
  "XMLHttpRequest",
  "alert",
  "navigator",
  "URLSearchParams",
  "fetch",
]);

// Server scripts run outside a browser, but TypeScript's DOM library lets
// these names compile. Locals that reuse a name resolve to a binding and are left alone.
export const noBrowserGlobals = defineRule({
  query: ast("JS_REFERENCE_IDENTIFIER", { semantic: true }),
  run(node, { model }) {
    if (!BROWSER_GLOBALS.has(node.text) || model.binding(node)) return;
    if (scriptSide(node) !== "server") return;
    registerDiagnostic(
      node,
      "error",
      `'${node.text}' does not exist in server scripts.`,
    );
  },
});
