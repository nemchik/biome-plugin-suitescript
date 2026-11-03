import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { definedOptions } from "../lib/required-options.ts";

const REQUIRED: Record<string, string[]> = {
  delete: ["url"],
  get: ["url"],
  post: ["url", "body"],
  put: ["url", "body"],
  request: ["method", "url"],
  requestRestlet: ["scriptId", "deploymentId"],
  requestSuitelet: ["scriptId", "deploymentId"],
  requestSuiteTalkRest: ["url"],
};

// Oracle (N/https method pages): each method lists its required options and
// throws SSS_MISSING_REQD_ARGUMENT ("Missing a required argument") without them.
// The type definitions (N/http.d.ts, N/https.d.ts) require the same options.
// Only a call with an options object literal and no spread is checked.
export const requireHttpsOptions = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const match = /^https\.(\w+?)(\.promise)?$/.exec(node.callee?.text ?? "");
    const required = match?.[1] && REQUIRED[match[1]];
    const defined = required && definedOptions(node);
    if (!required || !defined) return;
    for (const name of required) {
      if (!defined.has(name)) {
        registerDiagnostic(
          node,
          "error",
          `${node.callee?.text}() needs the '${name}' option.`,
        );
      }
    }
  },
});
