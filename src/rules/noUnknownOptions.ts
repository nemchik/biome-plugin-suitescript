import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { moduleCall } from "../lib/module-calls.ts";
import { objectMembers, optionsObject } from "../lib/options.ts";

// An option the type definitions (Tier 2) do not list for a module-level function
// is ignored at runtime, so a typo in an optional option goes unnoticed. A typo in
// a required option is also caught by requireOptions. Functions whose options
// type accepts any key are skipped.
export const noUnknownOptions = defineRule({
  query: ast("JS_CALL_EXPRESSION", { semantic: true }),
  run(node, { model }) {
    const call = moduleCall(node, model);
    if (!call || call.alternatives === 0) return;
    if (call.alternatives.some((alt) => alt[2])) return;
    const options = optionsObject(node);
    if (!options) return;
    const known = new Set(call.alternatives.flatMap(([, names]) => names));
    for (const member of objectMembers(options)) {
      if (member.kind === "JS_SPREAD") return;
      if (member.kind !== "JS_PROPERTY_OBJECT_MEMBER") continue;
      const name = member.children()[0]?.text.replace(/^['"]|['"]$/g, "");
      if (name && !known.has(name)) {
        registerDiagnostic(
          member,
          "warning",
          `${call.callee}() does not take an '${name}' option.`,
        );
      }
    }
  },
});
