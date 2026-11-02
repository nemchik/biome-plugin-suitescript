import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

// NetSuite runs GraalJS; Oracle's guidance is to use array methods, not
// generators or Symbol.iterator.
export const noNativeIterators = defineRule({
  query: ast(
    "JS_FUNCTION_DECLARATION",
    "JS_FUNCTION_EXPRESSION",
    "JS_STATIC_MEMBER_EXPRESSION",
  ),
  run(node) {
    if (node.kind === "JS_STATIC_MEMBER_EXPRESSION") {
      if (node.text === "Symbol.iterator") {
        registerDiagnostic(node, "warning", "Avoid Symbol.iterator.");
      }
    } else if (node.starToken) {
      registerDiagnostic(node, "warning", "Avoid generator functions.");
    }
  },
});
