import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { objectMembers, optionsObject, propertyValue } from "../lib/options.ts";

const INTERNAL =
  /^https\.(requestRestlet|requestSuitelet|requestSuiteTalkRest)(\.promise)?$/;

// Oracle (https.requestRestlet, requestSuitelet, requestSuiteTalkRest): "Sends an
// HTTPS request to a RESTlet and returns the response. Authentication headers are
// automatically added." and the error SSS_AUTHORIZATION_HEADER_NOT_ALLOWED: "The
// authorization header is set."
export const noAuthorizationHeaderInInternalRequest = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!INTERNAL.test(node.callee?.text ?? "")) return;
    const options = optionsObject(node);
    const headers = options && propertyValue(options, "headers");
    if (headers?.kind !== "JS_OBJECT_EXPRESSION") return;
    for (const member of objectMembers(headers)) {
      const name = member.children()[0]?.text.replace(/^['"]|['"]$/g, "");
      if (name?.toLowerCase() === "authorization") {
        registerDiagnostic(
          member,
          "error",
          "Do not set an Authorization header; NetSuite adds authentication to internal requests.",
        );
      }
    }
  },
});
