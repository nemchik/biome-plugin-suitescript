import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { callArguments, stringValue } from "../lib/options.ts";
import { scriptSide } from "../lib/script-side.ts";

const SENSITIVE = /token|password|secret|api[_-]?key|ssn|credit|card|auth/i;

// Tier 0: docs/adr/0005-guessing-rules-are-in-no-preset.md.
// Oracle's OWASP skill: "`localStorage` and `sessionStorage` are accessible to any
// JavaScript running on the same origin. If an XSS vulnerability exists, stored
// tokens, PII, or session data can be exfiltrated", and "Never store tokens or PII
// in localStorage". LOW CONFIDENCE, so no preset includes it: it guesses from the
// key name.
export const noSensitiveBrowserStorage = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (
      !/^(localStorage|sessionStorage)\.setItem$/.test(node.callee?.text ?? "")
    )
      return;
    if (scriptSide(node) === "server") return;
    const key = callArguments(node)[0];
    const name = stringValue(key);
    if (name && SENSITIVE.test(name)) {
      registerDiagnostic(
        key ?? node,
        "warning",
        `Do not keep '${name}' in browser storage; any script on the page can read it.`,
      );
    }
  },
});
