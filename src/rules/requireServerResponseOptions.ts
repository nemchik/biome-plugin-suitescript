import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { definedOptions } from "../lib/required-options.ts";

const REQUIRED: Record<string, string[]> = {
  addHeader: ["name", "value"],
  getHeader: ["name"],
  renderPdf: ["xmlString"],
  sendRedirect: ["type", "identifier"],
  setHeader: ["name", "value"],
  write: ["output"],
  writeFile: ["file"],
  writeLine: ["output"],
  writePage: ["pageObject"],
};

// Oracle (ServerResponse method pages): each method lists its required options and
// throws SSS_MISSING_REQD_ARGUMENT without them. The type definitions
// (N/http.d.ts) require the same options. Only calls on a receiver named
// like a response, with an options object literal and no spread, are checked.
export const requireServerResponseOptions = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const match = /response\.(\w+)$/i.exec(node.callee?.text ?? "");
    const method = match?.[1];
    const required = method && REQUIRED[method];
    const defined = required && definedOptions(node);
    if (!required || !defined) return;
    for (const name of required) {
      if (!defined.has(name)) {
        registerDiagnostic(
          node,
          "error",
          `${method}() needs the '${name}' option.`,
        );
      }
    }
  },
});
