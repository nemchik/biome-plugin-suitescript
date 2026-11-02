// Helpers shared by rules that need to know a node sits in a SuiteScript module.
import type { AnyJsAstNode } from "@biomejs/runtime/plugin";
import { importsNetSuite } from "./biome-modules.ts";
import { parseDefine } from "./define.ts";

/** Whether a node is inside an AMD `define([...], fn)` or an ES module importing `N/` modules. */
export function inSuiteScriptModule(node: AnyJsAstNode): boolean {
  return node.ancestors().some((a) => {
    if (a.kind === "JS_CALL_EXPRESSION") return !!parseDefine(a);
    return a.kind === "JS_MODULE" && importsNetSuite(a);
  });
}

/** Whether an expression is built only from string literals (and `+`). */
export function isStaticString(node: AnyJsAstNode | undefined): boolean {
  if (!node) return false;
  if (node.kind === "JS_STRING_LITERAL_EXPRESSION") return true;
  if (node.kind === "JS_TEMPLATE_EXPRESSION") return !node.text.includes("${");
  if (
    node.kind === "JS_BINARY_EXPRESSION" ||
    node.kind === "JS_PARENTHESIZED_EXPRESSION"
  )
    return node.children().every(isStaticString);
  return false;
}
