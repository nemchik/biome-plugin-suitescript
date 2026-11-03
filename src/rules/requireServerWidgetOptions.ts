import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { definedOptions } from "../lib/required-options.ts";

const LABELLED = ["id", "label"];
const REQUIRED: Record<string, string[]> = {
  addButton: LABELLED,
  addColumn: [...LABELLED, "type"],
  addCredentialField: [...LABELLED, "restrictToDomains", "restrictToScriptIds"],
  addField: [...LABELLED, "type"],
  addFieldGroup: LABELLED,
  addSecretKeyField: [...LABELLED, "restrictToScriptIds"],
  addSublist: [...LABELLED, "type"],
  addSubtab: LABELLED,
  addTab: LABELLED,
};

// Oracle (N/ui/serverWidget method pages): each add method lists the options it
// requires and throws SSS_MISSING_REQD_ARGUMENT without them. The receiver cannot
// be typed, so a method of the same name on another object can misfire. Only an
// options object literal without a spread is checked.
export const requireServerWidgetOptions = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const method = /\.(\w+)$/.exec(node.callee?.text ?? "")?.[1];
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
