import type { JsCallExpression } from "@biomejs/runtime/plugin";
import { hasSpread, objectMembers, optionsObject } from "./options.ts";

/** Names of the properties an options object literal defines, or undefined if a spread hides some. */
export function definedOptions(
  call: JsCallExpression,
): Set<string> | undefined {
  const options = optionsObject(call);
  if (!options || hasSpread(options)) return undefined;
  const names = new Set<string>();
  for (const member of objectMembers(options)) {
    const name = member.children()[0]?.text.replace(/^['"]|['"]$/g, "");
    if (name) names.add(name);
  }
  return names;
}
