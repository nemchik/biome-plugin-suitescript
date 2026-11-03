// Helpers for reading the arguments of a call, most often an options object literal.
import type { AnyJsAstNode, JsCallExpression } from "@biomejs/runtime/plugin";

const unquote = (text: string): string => text.replace(/^['"]|['"]$/g, "");

/** The arguments of a call. */
export function callArguments(call: JsCallExpression): readonly AnyJsAstNode[] {
  return call.arguments?.children()[0]?.children() ?? [];
}

/** The members of an object literal (properties, methods and spreads). */
export function objectMembers(object: AnyJsAstNode): readonly AnyJsAstNode[] {
  return object.children()[0]?.children() ?? [];
}

/** The object literal passed as argument `index`, if it is one. */
export function optionsObject(
  call: JsCallExpression,
  index = 0,
): AnyJsAstNode | undefined {
  const argument = callArguments(call)[index];
  return argument?.kind === "JS_OBJECT_EXPRESSION" ? argument : undefined;
}

/** The value node of property `key` in an object literal. */
export function propertyValue(
  object: AnyJsAstNode,
  key: string,
): AnyJsAstNode | undefined {
  for (const member of objectMembers(object)) {
    if (member.kind !== "JS_PROPERTY_OBJECT_MEMBER") continue;
    const [name, value] = member.children();
    if (name && unquote(name.text) === key) return value;
  }
  return undefined;
}

/** Whether an object literal contains a spread, so its keys are not all known. */
export function hasSpread(object: AnyJsAstNode): boolean {
  return objectMembers(object).some((m) => m.kind === "JS_SPREAD");
}

/** The text of a string literal without its quotes, or undefined for anything else. */
export function stringValue(
  node: AnyJsAstNode | undefined,
): string | undefined {
  return node?.kind === "JS_STRING_LITERAL_EXPRESSION"
    ? unquote(node.text)
    : undefined;
}
