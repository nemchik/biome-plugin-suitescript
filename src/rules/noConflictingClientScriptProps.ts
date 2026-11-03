import type { AnyJsAstNode } from "@biomejs/runtime/plugin";
import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { isFunction } from "../lib/script-side.ts";

// Oracle (Form.clientScriptModulePath and clientScriptFileId): PROPERTY_VALUE_CONFLICT,
// "You attempted to set this value when the Form.clientScriptFileId property value
// has already been specified." Setting both on the same form fails.
export const noConflictingClientScriptProps = defineRule({
  query: ast("JS_ASSIGNMENT_EXPRESSION"),
  run(node) {
    const target = node.children()[0];
    if (target?.kind !== "JS_STATIC_MEMBER_ASSIGNMENT") return;
    const [object, member] = target.children();
    if (member?.text !== "clientScriptModulePath" || !object) return;
    const scope: AnyJsAstNode | undefined = node.ancestors().find(isFunction);
    if (!scope) return;
    const conflict = (function find(n: AnyJsAstNode): boolean {
      for (const child of n.children()) {
        if (child.kind === "JS_ASSIGNMENT_EXPRESSION") {
          const t = child.children()[0];
          if (
            t?.kind === "JS_STATIC_MEMBER_ASSIGNMENT" &&
            t.children()[1]?.text === "clientScriptFileId" &&
            t.children()[0]?.text === object.text
          )
            return true;
        }
        if (find(child)) return true;
      }
      return false;
    })(scope);
    if (conflict) {
      registerDiagnostic(
        node,
        "error",
        `Set either clientScriptFileId or clientScriptModulePath on ${object.text}, not both.`,
      );
    }
  },
});
