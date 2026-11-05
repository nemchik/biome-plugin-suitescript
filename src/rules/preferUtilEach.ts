import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { callArguments } from "../lib/options.ts";
import { inSuiteScriptModule } from "../lib/suitescript.ts";

const OBJECT_ITERATORS = /^Object\.(keys|values|entries)$/;

// Tier 4 (SuiteScript-specific, opinionated): prefer `util.each(iterable, callback)`
// to `forEach` when the receiver is certainly an array. Oracle's util.each page:
// "Iterates over each member in an Object or Array", returning the original collection.
// No source states that `util.each` is better; this is a house preference.
// Verified at runtime (docs/verification/results/util-each.md, NetSuite 2026.2):
// util.each iterates arrays and the own keys of plain objects, but does nothing for a
// Set or a Map, and returning false does not stop it. So only receivers that are
// certainly arrays are flagged: an array literal and Object.keys/values/entries(o).
// A bare `x.forEach(...)` is not flagged, because x may be a Set or a Map, which
// util.each would silently skip. `for...of` is not flagged either (util.each has no
// early exit and does not take iterables).
export const preferUtilEach = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const callee = node.callee;
    if (callee?.kind !== "JS_STATIC_MEMBER_EXPRESSION") return;
    const [receiver, member] = callee.children();
    if (member?.text !== "forEach" || !receiver) return;
    if (callArguments(node).length !== 1) return;
    let message: string | undefined;
    if (receiver.kind === "JS_ARRAY_EXPRESSION") {
      message = "Use util.each(array, callback) instead of .forEach().";
    } else if (
      receiver.kind === "JS_CALL_EXPRESSION" &&
      OBJECT_ITERATORS.test(receiver.callee?.text ?? "")
    ) {
      const target = callArguments(receiver)[0]?.text;
      if (!target) return;
      message = `Use util.each(${target}, (value, key) => ...) instead of ${receiver.callee?.text}().forEach(); util.each passes the value first and the key second.`;
    }
    if (!message || !inSuiteScriptModule(node)) return;
    registerDiagnostic(node, "warning", message);
  },
});
