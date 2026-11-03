import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { objectMembers, optionsObject, propertyValue } from "../lib/options.ts";

const BLOCKED = new Set([
  "connection",
  "content-length",
  "host",
  "jsessionid",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via",
]);

// Oracle (N/https, General Blocked HTTPS Headers): "certain headers cannot be set
// manually when using N/https module methods. If a script attempts to set values
// for any of the following headers, the values are discarded."
export const noBlockedHttpsHeader = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!/^https\.\w+(\.promise)?$/.test(node.callee?.text ?? "")) return;
    const options = optionsObject(node);
    const headers = options && propertyValue(options, "headers");
    if (headers?.kind !== "JS_OBJECT_EXPRESSION") return;
    for (const member of objectMembers(headers)) {
      const name = member.children()[0]?.text.replace(/^['"]|['"]$/g, "");
      if (name && BLOCKED.has(name.toLowerCase())) {
        registerDiagnostic(
          member,
          "warning",
          `NetSuite discards the ${name} header set in an N/https request.`,
        );
      }
    }
  },
});
