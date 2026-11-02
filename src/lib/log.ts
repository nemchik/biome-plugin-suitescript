import type { AnyJsAstNode, JsCallExpression } from "@biomejs/runtime/plugin";
import { dependencies } from "./biome-modules.ts";

const LOG_MEMBERS = ["debug", "audit", "error", "emergency"];

/** Name the N/log module is bound to (define() or import), else `log`. */
function logIdentifier(call: JsCallExpression): string {
  for (const ancestor of call.ancestors()) {
    const scopes =
      ancestor.kind === "JS_MODULE"
        ? (ancestor
            .children()
            .find((c) => c.kind === "JS_MODULE_ITEM_LIST")
            ?.children() ?? [])
        : [ancestor];
    for (const scope of scopes) {
      const found = dependencies(scope).find(
        (d) => d.name === "N/log" && d.param,
      );
      if (found?.param) return found.param.text;
    }
  }
  return "log";
}

export interface LogCall {
  prop: string;
  args: readonly AnyJsAstNode[];
  firstArg: AnyJsAstNode;
}

/** Matches `log.<debug|audit|error|emergency>(...)` calls that pass arguments. */
export function logCall(call: JsCallExpression): LogCall | undefined {
  const callee = call.callee;
  if (callee?.kind !== "JS_STATIC_MEMBER_EXPRESSION") return undefined;
  const [object, member] = callee.children();
  if (!object || !member || !LOG_MEMBERS.includes(member.text))
    return undefined;
  if (object.text !== logIdentifier(call)) return undefined;
  const args = call.arguments?.children()[0]?.children() ?? [];
  const firstArg = args[0];
  if (!firstArg) return undefined;
  return { args, firstArg, prop: member.text };
}

/** Whether an object literal argument defines `key`. */
export function hasProperty(objectNode: AnyJsAstNode, key: string): boolean {
  const members = objectNode.children()[0]?.children() ?? [];
  return members.some((m) => {
    const name = m.children()[0]?.text;
    return name === key || name === `"${key}"` || name === `'${key}'`;
  });
}
