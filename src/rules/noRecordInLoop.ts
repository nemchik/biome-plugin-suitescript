import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

const LOOPS = [
  "JS_FOR_STATEMENT",
  "JS_FOR_OF_STATEMENT",
  "JS_FOR_IN_STATEMENT",
  "JS_WHILE_STATEMENT",
  "JS_DO_WHILE_STATEMENT",
];
const ITERATORS = /\.(forEach|each|map)$/;
const LOOKUPS =
  /^(record\.load|query\.runSuiteQL(Paged)?|search\.(create|load))(\.promise)?$/;

// Oracle's SAFE guide: "NEVER run queries inside loops" (the N+1 problem) and
// "Loading records in loops: use searches or bulk operations." Loading a record or
// running a query or search per iteration burns governance. Only record.load is
// named for records, so record.create and submitFields are not flagged. Map/Reduce
// `map` handles one record per call, so keep this rule out of those files.
export const noRecordInLoop = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!LOOKUPS.test(node.callee?.text ?? "")) return;
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
        `${node.callee?.text}() inside a loop; fetch what you need with one search or query instead.`,
      );
    }
  },
});
