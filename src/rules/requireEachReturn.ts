import type { AnyJsAstNode } from "@biomejs/runtime/plugin";
import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { callArguments } from "../lib/options.ts";
import { isFunction } from "../lib/script-side.ts";

const EACH = /\.(run|iterator)\(\)\.each$/;

/** Whether a function body returns a value, ignoring nested functions. */
function returnsValue(node: AnyJsAstNode): boolean {
  for (const child of node.children()) {
    if (isFunction(child)) continue;
    if (child.kind === "JS_RETURN_STATEMENT" && child.children()[0])
      return true;
    if (returnsValue(child)) return true;
  }
  return false;
}

// Oracle's upgrade skill: "`.each()` callback must return `true` to continue
// (stops on `false`)". A callback that never returns a value stops after the first
// row without an error. Only `.run().each` and `.iterator().each` are checked. A
// block body must return some value; an expression body that is a call (such as
// `ids.push(id)`) returns whatever the call does, which is not `true`.
export const requireEachReturn = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!EACH.test(node.callee?.text ?? "")) return;
    const callback = callArguments(node)[0];
    if (!callback || !isFunction(callback)) return;
    const body = callback.children().find((c) => c.kind === "JS_FUNCTION_BODY");
    const flagged = body
      ? !returnsValue(body)
      : callback.children().at(-1)?.kind === "JS_CALL_EXPRESSION";
    if (flagged) {
      registerDiagnostic(
        callback,
        "warning",
        "The each() callback must return true to continue to the next row.",
      );
    }
  },
});
