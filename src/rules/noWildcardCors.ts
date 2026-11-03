import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { headerCall } from "../lib/headers.ts";
import { stringValue } from "../lib/options.ts";

// Oracle's OWASP skill: "Setting `Access-Control-Allow-Origin: *` allows any
// website to make cross-origin requests to the RESTlet, enabling data theft from
// authenticated sessions", and "Use explicit CORS origin allowlist (never `*`)".
export const noWildcardCors = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const header = headerCall(node);
    if (
      header?.name === "access-control-allow-origin" &&
      stringValue(header.value) === "*"
    ) {
      registerDiagnostic(
        header.value ?? node,
        "warning",
        "Do not allow every origin with Access-Control-Allow-Origin: *; list the allowed origins.",
      );
    }
  },
});
