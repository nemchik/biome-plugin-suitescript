import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

// SuiteScript 2.1 only: nlapiXxx functions and nlobjXxx objects are 1.0 leftovers.
// Oracle's upgrade skill lists "Any `nlapi[A-Z]` function call" and "Any
// `nlobj[A-Z]` constructor or instanceof" as Critical, and also "Old getter/setter
// methods" (`.getFieldValue()`, `.setFieldValue()`) and "Old error handling"
// (`e.getCode()`). Only method names that exist in no 2.1 module are flagged, so a
// 2.1 method of the same name on another object is never hit.
const GLOBAL_OBJECTS = ["window", "globalThis", "self", "top", "this"];
const V1_METHODS = new Set([
  "getLineItemCount",
  "getLineItemValue",
  "getLineItemValues",
  "getLineItemText",
  "getLineItemField",
  "setLineItemValue",
  "setLineItemValues",
  "insertLineItem",
  "removeLineItem",
  "selectLineItem",
  "selectNewLineItem",
  "commitLineItem",
  "findLineItemValue",
  "getCurrentLineItemValue",
  "getCurrentLineItemValues",
  "setCurrentLineItemValue",
  "getFieldValue",
  "getFieldValues",
  "setFieldValue",
  "setFieldValues",
  "getFieldText",
  "getFieldTexts",
  "setFieldText",
  "setFieldTexts",
  "addSubList",
  "getSubList",
  "insertSubList",
  "addSubTab",
  "getSubTab",
  "insertSubTab",
]);
const V1_ERROR_METHODS = new Set(["getCode", "getDetails", "getStackTrace"]);
const V1_NAME = /^(nlapi|nlobj)[A-Z]/;

export const noSuiteScript1Api = defineRule({
  query: ast(
    "JS_REFERENCE_IDENTIFIER",
    "JS_STATIC_MEMBER_EXPRESSION",
    "JS_CALL_EXPRESSION",
  ),
  run(node) {
    if (node.kind === "JS_REFERENCE_IDENTIFIER") {
      if (V1_NAME.test(node.text)) {
        registerDiagnostic(
          node,
          "error",
          `'${node.text}' is SuiteScript 1.0; use the SuiteScript 2.1 N/ modules.`,
        );
      }
      return;
    }
    if (node.kind === "JS_STATIC_MEMBER_EXPRESSION") {
      const [object, member] = node.children();
      if (
        object &&
        member &&
        GLOBAL_OBJECTS.includes(object.text) &&
        V1_NAME.test(member.text)
      ) {
        registerDiagnostic(
          node,
          "error",
          `'${member.text}' is SuiteScript 1.0; use the SuiteScript 2.1 N/ modules.`,
        );
      }
      return;
    }
    const callee = node.callee;
    if (callee?.kind !== "JS_STATIC_MEMBER_EXPRESSION") return;
    const [object, member] = callee.children();
    if (!object || !member) return;
    if (V1_METHODS.has(member.text)) {
      registerDiagnostic(
        node,
        "error",
        `'${member.text}()' is a SuiteScript 1.0 method; use the SuiteScript 2.1 equivalent.`,
      );
    } else if (
      V1_ERROR_METHODS.has(member.text) &&
      isCatchParameter(node, object.text)
    ) {
      registerDiagnostic(
        node,
        "error",
        `'${member.text}()' is SuiteScript 1.0; in 2.1 the error exposes a property.`,
      );
    }
  },
});

function isCatchParameter(
  node: { ancestors(): Iterable<{ kind: string; text: string }> },
  name: string,
): boolean {
  for (const ancestor of node.ancestors()) {
    if (ancestor.kind === "JS_CATCH_CLAUSE") {
      return new RegExp(`^catch\\s*\\(\\s*${name}\\b`).test(ancestor.text);
    }
  }
  return false;
}
