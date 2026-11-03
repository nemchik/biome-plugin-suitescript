import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { callArguments } from "../lib/options.ts";
import { scriptSide } from "../lib/script-side.ts";
import { isStaticString } from "../lib/suitescript.ts";

const SINKS = ["innerHTML", "outerHTML"];
const CALL_SINKS = /\.(insertAdjacentHTML|write|writeln)$/;
const SANITIZED = /sanitize|escape|encode|purify/i;

// Oracle's OWASP skill: "No `innerHTML` with unsanitized content (use
// `textContent` for untrusted data)", and the same for `document.write`,
// `outerHTML` and `insertAdjacentHTML`. Its own safe example assigns a static
// string, so only a value that is not a literal is flagged, and a value wrapped
// in a call named like a sanitizer is skipped. Server scripts are left to
// noBrowserGlobals.
export const noInnerHtml = defineRule({
  query: ast("JS_ASSIGNMENT_EXPRESSION", "JS_CALL_EXPRESSION"),
  run(node) {
    let value: ReturnType<typeof callArguments>[number] | undefined;
    if (node.kind === "JS_ASSIGNMENT_EXPRESSION") {
      const [target, assigned] = node.children();
      if (
        target?.kind === "JS_STATIC_MEMBER_ASSIGNMENT" &&
        SINKS.includes(target.children()[1]?.text ?? "")
      )
        value = assigned;
    } else {
      const callee = node.callee?.text ?? "";
      if (!CALL_SINKS.test(callee)) return;
      if (/\.(write|writeln)$/.test(callee) && !callee.startsWith("document."))
        return;
      const args = callArguments(node);
      value = callee.endsWith(".insertAdjacentHTML") ? args[1] : args[0];
    }
    if (!value || isStaticString(value)) return;
    if (value.kind === "JS_CALL_EXPRESSION" && SANITIZED.test(value.text))
      return;
    if (scriptSide(node) === "server") return;
    registerDiagnostic(
      value,
      "warning",
      "Do not write unsanitized HTML; use textContent for untrusted data.",
    );
  },
});
