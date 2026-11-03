import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { callArguments } from "../lib/options.ts";
import { descendants } from "../lib/script-side.ts";

// Oracle (entry point script validation): "The following script is invalid
// because it uses a require statement instead of a define statement. If you try
// to upload a script that includes a require statement, the system returns the
// error 'SuiteScript 2.0 entry point scripts must implement one script type
// function.'" Only a top-level require([...], callback) in a file with no
// define() is flagged; require inside a define() callback is legitimate.
export const noRequireInsteadOfDefine = defineRule({
  query: ast("JS_MODULE", "JS_SCRIPT"),
  run(node) {
    const calls = [...descendants(node)].filter(
      (n) => n.kind === "JS_CALL_EXPRESSION",
    );
    if (calls.some((c) => c.callee?.text === "define")) return;
    for (const call of calls) {
      if (call.callee?.text !== "require") continue;
      const [deps, callback] = callArguments(call);
      if (deps?.kind === "JS_ARRAY_EXPRESSION" && callback) {
        registerDiagnostic(
          call,
          "error",
          "Use define() instead of require(); NetSuite rejects an entry point script without a define call.",
        );
      }
    }
  },
});
