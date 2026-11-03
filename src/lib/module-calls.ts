// Resolves `record.load(...)`-style calls and `record.Type.X` reads to the N/ module
// the receiver is bound to by define() or import, and looks them up in the data
// generated from the type definitions.
import type { AnyJsAstNode, JsCallExpression } from "@biomejs/runtime/plugin";
import { dependencies } from "./biome-modules.ts";
import { parseDefine } from "./define.ts";
import type { Alternative, ModuleTypings } from "./typings.ts";
import { TYPINGS } from "./typings-data.ts";

/** The N/ module `alias` is bound to where `node` sits, or undefined. */
export function moduleOfAlias(
  node: AnyJsAstNode,
  alias: string,
): string | undefined {
  for (const ancestor of node.ancestors()) {
    let scopes: readonly AnyJsAstNode[] = [];
    if (ancestor.kind === "JS_CALL_EXPRESSION" && parseDefine(ancestor)) {
      scopes = [ancestor];
    } else if (ancestor.kind === "JS_MODULE") {
      scopes =
        ancestor
          .children()
          .find((c) => c.kind === "JS_MODULE_ITEM_LIST")
          ?.children() ?? [];
    }
    for (const scope of scopes) {
      const found = dependencies(scope).find(
        (d) => d.param?.text === alias && d.name,
      );
      if (found?.name) return found.name;
    }
  }
  return undefined;
}

export interface ModuleCall {
  module: string;
  fn: string;
  /** What the callee reads, for messages (`record.load`). */
  callee: string;
  typings: ModuleTypings;
  alternatives: Alternative[] | 0;
}

/** A call to a function of a loaded N/ module that the type definitions describe. */
export function moduleCall(call: JsCallExpression): ModuleCall | undefined {
  let callee = call.callee;
  if (callee?.kind !== "JS_STATIC_MEMBER_EXPRESSION") return undefined;
  if (callee.children()[1]?.text === "promise") {
    const inner = callee.children()[0];
    if (inner?.kind !== "JS_STATIC_MEMBER_EXPRESSION") return undefined;
    callee = inner;
  }
  const [object, member] = callee.children();
  if (object?.kind !== "JS_IDENTIFIER_EXPRESSION" || !member) return undefined;
  const module = moduleOfAlias(call, object.text);
  const typings = module ? TYPINGS[module] : undefined;
  const alternatives = typings?.functions[member.text];
  if (!module || !typings || alternatives === undefined) return undefined;
  return {
    alternatives,
    callee: callee.text,
    fn: member.text,
    module,
    typings,
  };
}
