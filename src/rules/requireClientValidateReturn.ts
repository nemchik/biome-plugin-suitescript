import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { descendants, functionName, scriptSide } from "../lib/script-side.ts";

const VALIDATORS = [
  "saveRecord",
  "validateField",
  "validateLine",
  "validateInsert",
  "validateDelete",
];

// Oracle: saveRecord and validateField return "true ... false otherwise". Only a
// body with no `return <value>` at all is flagged; code paths are not analysed.
export const requireClientValidateReturn = defineRule({
  query: ast(
    "JS_FUNCTION_DECLARATION",
    "JS_FUNCTION_EXPRESSION",
    "JS_ARROW_FUNCTION_EXPRESSION",
    "JS_METHOD_OBJECT_MEMBER",
  ),
  run(node) {
    const name = functionName(node);
    if (!name || !VALIDATORS.includes(name)) return;
    const body = node.children().find((c) => c.kind === "JS_FUNCTION_BODY");
    if (!body || scriptSide(node) !== "client") return;
    for (const d of descendants(body)) {
      if (d.kind === "JS_RETURN_STATEMENT" && d.children().length > 0) return;
    }
    registerDiagnostic(node, "warning", `'${name}' must return true or false.`);
  },
});
