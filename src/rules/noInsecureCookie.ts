import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { headerCall } from "../lib/headers.ts";
import { isStaticString } from "../lib/suitescript.ts";

// Tier 0: docs/adr/0005-guessing-rules-are-in-no-preset.md.
// Oracle's OWASP skill: "Cookies set without HttpOnly, Secure, and SameSite
// attributes are vulnerable to theft via XSS, interception over HTTP, and
// cross-site request forgery", and Suitelet cookies "must include security
// attributes". LOW CONFIDENCE, so no preset includes it: only a Set-Cookie value
// built from literals can be checked, and the skill assumes a Suitelet may set
// the header at all, which we have not confirmed.
export const noInsecureCookie = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const header = headerCall(node);
    if (header?.name !== "set-cookie" || !header.value) return;
    if (
      !isStaticString(header.value) &&
      header.value.kind !== "JS_CALL_EXPRESSION"
    )
      return;
    const text = header.value.text;
    if (
      !/httponly/i.test(text) ||
      !/secure/i.test(text) ||
      !/samesite/i.test(text)
    ) {
      registerDiagnostic(
        header.value,
        "warning",
        "Set-Cookie needs the HttpOnly, Secure and SameSite attributes.",
      );
    }
  },
});
