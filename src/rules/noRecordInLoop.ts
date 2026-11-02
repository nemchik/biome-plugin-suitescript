import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

const LOOPS = [
  "JS_FOR_STATEMENT",
  "JS_FOR_OF_STATEMENT",
  "JS_FOR_IN_STATEMENT",
  "JS_WHILE_STATEMENT",
  "JS_DO_WHILE_STATEMENT",
];
const ITERATORS = /\.(forEach|each|map)$/;
const RECORD_CALLS = ["record.load", "record.create"];

// Loading or creating a record per iteration burns governance; search or
// submitFields in bulk instead. Opt-in: Map/Reduce `map` handles one record per call.
export const noRecordInLoop = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!RECORD_CALLS.includes(node.callee?.text ?? "")) return;
    const inLoop = node.ancestors().some((a) => {
      if (LOOPS.includes(a.kind)) return true;
      if (a.kind !== "JS_CALL_ARGUMENT_LIST") return false;
      const call = a.parent?.parent;
      return (
        call?.kind === "JS_CALL_EXPRESSION" &&
        ITERATORS.test(call.children()[0]?.text ?? "")
      );
    });
    if (inLoop) {
      registerDiagnostic(
        node,
        "warning",
        `${node.callee?.text}() inside a loop; use a search or submitFields instead.`,
      );
    }
  },
});
