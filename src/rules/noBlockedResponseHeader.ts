import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { headerCall } from "../lib/headers.ts";

const BLOCKED = new Set([
  "allow",
  "content-location",
  "content-md5",
  "content-range",
  "date",
  "location",
  "proxy-authenticate",
  "public-key-pins",
  "public-key-pins-report-only",
  "retry-after",
  "server",
  "strict-transport-security",
  "upgrade-insecure-requests",
  "warning",
  "www-authenticate",
]);

// Oracle (N/https, HTTPS Header Information): "certain headers cannot be set
// manually when interacting with the https.ServerResponse Objects sent by
// Suitelets. If a script attempts to set values for any of these headers, the
// system throws an SSS_INVALID_HEADER error." Only calls on a receiver named like
// a response are checked.
export const noBlockedResponseHeader = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (!/response\.(setHeader|addHeader)$/i.test(node.callee?.text ?? ""))
      return;
    const header = headerCall(node);
    if (header && BLOCKED.has(header.name)) {
      registerDiagnostic(
        header.nameNode,
        "error",
        `A Suitelet cannot set the ${header.name} header; NetSuite throws SSS_INVALID_HEADER.`,
      );
    }
  },
});
