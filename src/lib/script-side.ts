// Biome-side helpers that classify the module around a node by its inferred script type.
import type { AnyJsAstNode } from "@biomejs/runtime/plugin";
import { esExportNames } from "./biome-modules.ts";
import { parseDefine } from "./define.ts";
import { amdReturnedNames } from "./entry-points.ts";
import { inferScriptType } from "./inference.ts";
import { type ScriptSide, sideOf } from "./module-script-types.ts";

/**
 * Whether the module containing `node` (a define() call or an ES module) is a
 * client or server script, judged from the entry points it returns. Undefined
 * for libraries and for entry points that cannot be analysed or are mixed.
 */
export function scriptSide(node: AnyJsAstNode): ScriptSide | undefined {
  for (const candidate of [node, ...node.ancestors()]) {
    let names: string[] | undefined;
    if (candidate.kind === "JS_CALL_EXPRESSION") {
      const def = parseDefine(candidate);
      if (!def) continue;
      names = amdReturnedNames(def);
    } else if (candidate.kind === "JS_MODULE") {
      names = esExportNames(candidate);
    } else {
      continue;
    }
    const inferred = names && inferScriptType(names);
    return inferred ? sideOf(inferred.types) : undefined;
  }
  return undefined;
}

const FUNCTION_KINDS = [
  "JS_FUNCTION_DECLARATION",
  "JS_FUNCTION_EXPRESSION",
  "JS_ARROW_FUNCTION_EXPRESSION",
  "JS_METHOD_OBJECT_MEMBER",
];

const unquote = (text: string): string => text.replace(/^['"]|['"]$/g, "");

/** The name a function is bound to: its declaration, variable, object key or `o.name =` target. */
export function functionName(fn: AnyJsAstNode): string | undefined {
  if (fn.kind === "JS_FUNCTION_DECLARATION")
    return fn.children().find((c) => c.kind === "JS_IDENTIFIER_BINDING")?.text;
  if (fn.kind === "JS_METHOD_OBJECT_MEMBER") {
    const name = fn.children()[0]?.text;
    return name ? unquote(name) : undefined;
  }
  const parent = fn.parent;
  if (parent?.kind === "JS_PROPERTY_OBJECT_MEMBER") {
    const name = parent.children()[0]?.text;
    return name ? unquote(name) : undefined;
  }
  if (parent?.kind === "JS_INITIALIZER_CLAUSE")
    return parent.parent
      ?.children()
      .find((c) => c.kind === "JS_IDENTIFIER_BINDING")?.text;
  if (parent?.kind === "JS_ASSIGNMENT_EXPRESSION") {
    const target = parent.children()[0];
    if (target?.kind === "JS_STATIC_MEMBER_ASSIGNMENT")
      return target.children()[1]?.text;
  }
  return undefined;
}

/** Names of the functions enclosing `node`, innermost first. */
export function enclosingFunctionNames(node: AnyJsAstNode): string[] {
  return node
    .ancestors()
    .filter((a) => FUNCTION_KINDS.includes(a.kind))
    .map(functionName)
    .filter((n): n is string => !!n);
}

export function isFunction(node: AnyJsAstNode): boolean {
  return FUNCTION_KINDS.includes(node.kind);
}

/** Every node below `node`, depth first. */
export function* descendants(node: AnyJsAstNode): Generator<AnyJsAstNode> {
  for (const child of node.children()) {
    yield child;
    yield* descendants(child);
  }
}
