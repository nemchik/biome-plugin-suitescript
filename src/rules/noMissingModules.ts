import {
  defineRule,
  registerDiagnostic,
  semantic,
} from "@biomejs/runtime/plugin";
import { MODULES } from "../lib/modules.ts";
import { inSuiteScriptModule } from "../lib/suitescript.ts";

// `util` is a global in SuiteScript 2.1, so it never needs loading. `log` is
// treated like every other module: load N/log when you call it.
const ALIASES = new Map(
  Object.entries(MODULES)
    .filter(([, identifier]) => identifier !== "util")
    .map(([name, identifier]) => [identifier, name]),
);

// Reports `record.load()` when `record` resolves to no binding, meaning the
// module was never added to `define()` or imported. Locals that shadow the
// name resolve to a binding and are left alone.
export const noMissingModules = defineRule({
  query: semantic("JS_REFERENCE_IDENTIFIER"),
  run(node, { model }) {
    const module = ALIASES.get(node.text);
    if (!module || model.binding(node)) return;
    const member = node.parent?.parent;
    if (
      member?.kind !== "JS_STATIC_MEMBER_EXPRESSION" ||
      member.children()[0]?.text !== node.text
    )
      return;
    if (!inSuiteScriptModule(node)) return;
    registerDiagnostic(
      node,
      "error",
      `'${node.text}' is used but ${module} is not loaded.`,
    );
  },
});
