import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

// Oracle's SAFE guide: "`function*` generators and `Symbol.iterator` usage passes
// Jest/Node.js but fails in GraalJS; use standard array methods instead." Its own
// samples use `for...of`, so that is not flagged. Generator methods (`*foo() {}`)
// are generators too. The failure claim comes only from this skill and has not been
// checked against Oracle's documentation.
export const noNativeIterators = defineRule({
  query: ast(
    "JS_FUNCTION_DECLARATION",
    "JS_FUNCTION_EXPRESSION",
    "JS_METHOD_OBJECT_MEMBER",
    "JS_METHOD_CLASS_MEMBER",
    "JS_STATIC_MEMBER_EXPRESSION",
  ),
  run(node) {
    if (node.kind === "JS_STATIC_MEMBER_EXPRESSION") {
      if (node.text === "Symbol.iterator") {
        registerDiagnostic(node, "error", "Avoid Symbol.iterator.");
      }
    } else if (node.starToken) {
      registerDiagnostic(node, "error", "Avoid generator functions.");
    }
  },
});
