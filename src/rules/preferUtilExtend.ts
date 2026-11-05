import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { callArguments } from "../lib/options.ts";
import { inSuiteScriptModule } from "../lib/suitescript.ts";

// Tier 4 (SuiteScript-specific, opinionated): prefer `util.extend(receiver, contributor)`
// to `Object.assign(receiver, contributor)`. Oracle's util.extend page: "Copies the
// properties in a source object to a destination object", returning the destination.
// No source states that `util.extend` is better; this is a house preference.
// Verified at runtime (docs/verification/results/util-extend.md, NetSuite 2026.2):
// util.extend mutates and returns the receiver, copies own enumerable properties
// shallowly and accepts a null contributor, exactly like two-argument Object.assign.
// Object spread (a new object) and for...in copies (inherited keys) are not
// equivalent, so they are not flagged, nor is Object.assign with three or more
// arguments or a spread argument.
export const preferUtilExtend = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (node.callee?.text !== "Object.assign") return;
    const args = callArguments(node);
    if (args.length !== 2 || args.some((a) => a.kind === "JS_SPREAD")) return;
    if (!inSuiteScriptModule(node)) return;
    registerDiagnostic(
      node,
      "warning",
      "Use util.extend(receiver, contributor) instead of Object.assign().",
    );
  },
});
