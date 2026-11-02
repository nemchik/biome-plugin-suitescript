import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { ALL_ENTRY_POINTS, GENERIC_ENTRY_POINTS } from "../lib/inference.ts";
import { functionName, scriptSide } from "../lib/script-side.ts";

// Oracle: "Do not deploy scripts with blank entry functions. They still load and
// may affect performance without doing any work." Only modules whose script type
// is inferred are checked, so libraries with an empty `get` or `run` are ignored.
export const noEmptyEntryPoints = defineRule({
  query: ast(
    "JS_FUNCTION_DECLARATION",
    "JS_FUNCTION_EXPRESSION",
    "JS_ARROW_FUNCTION_EXPRESSION",
    "JS_METHOD_OBJECT_MEMBER",
  ),
  run(node) {
    const name = functionName(node);
    if (!name || !ALL_ENTRY_POINTS.has(name) || GENERIC_ENTRY_POINTS.has(name))
      return;
    const body = node.children().find((c) => c.kind === "JS_FUNCTION_BODY");
    const empty = body?.children().every((c) => c.children().length === 0);
    if (!empty || !scriptSide(node)) return;
    registerDiagnostic(node, "warning", `Entry point '${name}' is empty.`);
  },
});
