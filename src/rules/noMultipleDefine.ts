import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { descendants } from "../lib/script-side.ts";

// Oracle (entry point script validation): "The script must include one, and only
// one, properly structured define statement. The script can't include multiple
// define statements." NetSuite rejects the upload with MULTIPLE_DEFINE_CALLS.
export const noMultipleDefine = defineRule({
  query: ast("JS_MODULE", "JS_SCRIPT"),
  run(node) {
    const defines = [...descendants(node)].filter(
      (n) => n.kind === "JS_CALL_EXPRESSION" && n.callee?.text === "define",
    );
    for (const extra of defines.slice(1)) {
      registerDiagnostic(
        extra,
        "error",
        "A script can call define() only once.",
      );
    }
  },
});
