import type { JsCallExpression } from "@biomejs/runtime/plugin";
import { optionsObject, propertyValue, stringValue } from "./options.ts";

/** The header name and value nodes of `x.setHeader({ name, value })` or `addHeader`. */
export function headerCall(call: JsCallExpression) {
  if (!/\.(setHeader|addHeader)$/.test(call.callee?.text ?? ""))
    return undefined;
  const options = optionsObject(call);
  const nameNode = options && propertyValue(options, "name");
  const name = stringValue(nameNode)?.toLowerCase();
  if (!options || !nameNode || !name) return undefined;
  return { name, nameNode, value: propertyValue(options, "value") };
}
