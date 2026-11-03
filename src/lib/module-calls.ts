// Resolves `record.load(...)`-style calls and `record.Type.X` reads to the N/ module
// the receiver is bound to by define() or import, and looks them up in the data
// generated from the type definitions.
import type {
  AnyJsAstNode,
  JsCallExpression,
  SemanticModel,
} from "@biomejs/runtime/plugin";
import { dependencies } from "./biome-modules.ts";
import { parseDefine, stringValue } from "./define.ts";
import { isFunction } from "./script-side.ts";
import type { Alternative, ModuleTypings } from "./typings.ts";
import { TYPINGS } from "./typings-data.ts";

const has = (object: object, key: string): boolean =>
  Object.hasOwn(object, key);

/**
 * The N/ module a receiver expression (`record` in `record.load`) is bound to by a
 * define() callback parameter or an import. A local variable or parameter of the
 * same name shadows it, and a global resolves to nothing.
 */
export function moduleOfReceiver(
  receiver: AnyJsAstNode,
  model: SemanticModel,
): string | undefined {
  if (receiver.kind !== "JS_IDENTIFIER_EXPRESSION") return undefined;
  const reference = receiver.children()[0];
  if (reference?.kind !== "JS_REFERENCE_IDENTIFIER") return undefined;
  const declaration = model.binding(reference)?.syntax();
  if (!declaration) return undefined;
  const nearestFunction = declaration.ancestors().find(isFunction);
  for (const ancestor of declaration.ancestors()) {
    if (ancestor.kind === "JS_IMPORT") {
      return dependencies(ancestor).find(
        (d) => d.param?.text === declaration.text,
      )?.name;
    }
    if (ancestor.kind === "JS_CALL_EXPRESSION") {
      const def = parseDefine(ancestor);
      if (def && nearestFunction?.text === def.callback.text) {
        const index = def.params.findIndex((p) => p?.text === declaration.text);
        return index >= 0 ? stringValue(def.elements[index]) : undefined;
      }
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

/** The generated data for a module, if there is any. */
export function typingsOf(
  module: string | undefined,
): ModuleTypings | undefined {
  return module && has(TYPINGS, module) ? TYPINGS[module] : undefined;
}

/** A call to a function of a loaded N/ module that the type definitions describe. */
export function moduleCall(
  call: JsCallExpression,
  model: SemanticModel,
): ModuleCall | undefined {
  let callee = call.callee;
  if (callee?.kind !== "JS_STATIC_MEMBER_EXPRESSION") return undefined;
  if (callee.children()[1]?.text === "promise") {
    const inner = callee.children()[0];
    if (inner?.kind !== "JS_STATIC_MEMBER_EXPRESSION") return undefined;
    callee = inner;
  }
  const [object, member] = callee.children();
  if (!object || !member) return undefined;
  const module = moduleOfReceiver(object, model);
  const typings = typingsOf(module);
  if (!module || !typings || !has(typings.functions, member.text)) {
    return undefined;
  }
  return {
    alternatives: typings.functions[member.text] as Alternative[] | 0,
    callee: callee.text,
    fn: member.text,
    module,
    typings,
  };
}
