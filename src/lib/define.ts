import type { AnyJsAstNode, JsCallExpression } from "@biomejs/runtime/plugin";

const FUNCTION_KINDS = [
  "JS_FUNCTION_EXPRESSION",
  "JS_ARROW_FUNCTION_EXPRESSION",
];

export interface Dependency {
  /** Module name without quotes, when the dependency is a string literal. */
  name: string | undefined;
  nameNode: AnyJsAstNode | undefined;
  /** The callback parameter / import binding bound to the module. */
  param: AnyJsAstNode | undefined;
}

export interface ParsedDefine {
  call: JsCallExpression;
  id: AnyJsAstNode | undefined;
  deps: AnyJsAstNode;
  elements: readonly AnyJsAstNode[];
  callback: AnyJsAstNode;
  params: (AnyJsAstNode | undefined)[];
  body: AnyJsAstNode | undefined;
}

/** Strips the quotes from a string literal expression node. */
export function stringValue(
  node: AnyJsAstNode | undefined,
): string | undefined {
  if (node?.kind !== "JS_STRING_LITERAL_EXPRESSION") return undefined;
  return node.text.slice(1, -1);
}

/**
 * Parses an AMD `define([...], function (...) {})` call.
 *
 * Returns undefined unless `call` is `define(...)` with a dependency array
 * followed by a function callback (the optional leading module id is allowed).
 */
export function parseDefine(call: JsCallExpression): ParsedDefine | undefined {
  if (call.callee?.text !== "define") return undefined;

  const args = call.arguments?.children()[0]?.children() ?? [];
  if (args.length < 2 || args.length > 3) return undefined;

  const deps = args[args.length - 2];
  const callback = args[args.length - 1];
  if (!deps || !callback) return undefined;
  if (deps.kind !== "JS_ARRAY_EXPRESSION") return undefined;
  if (!FUNCTION_KINDS.includes(callback.kind)) return undefined;

  const elements = deps.children()[0]?.children() ?? [];

  const callbackChildren = callback.children();
  let params: (AnyJsAstNode | undefined)[] = [];
  const parameters = callbackChildren.find((c) => c.kind === "JS_PARAMETERS");
  if (parameters) {
    params = (parameters.children()[0]?.children() ?? []).map((p) =>
      p.kind === "JS_FORMAL_PARAMETER"
        ? p.children().find((c) => c.kind === "JS_IDENTIFIER_BINDING")
        : undefined,
    );
  } else if (callback.kind === "JS_ARROW_FUNCTION_EXPRESSION") {
    // `x => ...` has a bare identifier binding instead of a parameter list.
    const single = callbackChildren.find(
      (c) => c.kind === "JS_IDENTIFIER_BINDING",
    );
    if (single) params = [single];
  }

  const body = callbackChildren.find(
    (c) =>
      c.kind === "JS_FUNCTION_BODY" ||
      (c.kind.endsWith("_EXPRESSION") && c !== parameters),
  );

  return {
    body,
    call,
    callback,
    deps,
    elements,
    id: args.length === 3 ? args[0] : undefined,
    params,
  };
}

/** Pairs each dependency string with its callback parameter, by position. */
export function pairs(def: ParsedDefine): Dependency[] {
  const length = Math.max(def.elements.length, def.params.length);
  const out: Dependency[] = [];
  for (let i = 0; i < length; i++) {
    const element = def.elements[i];
    const isString = element?.kind === "JS_STRING_LITERAL_EXPRESSION";
    out.push({
      name: stringValue(element),
      nameNode: isString ? element : undefined,
      param: def.params[i],
    });
  }
  return out;
}
