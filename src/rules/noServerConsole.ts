import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { scriptSide } from "../lib/script-side.ts";

// Tier 1 (SAFE guide, quick-reference.md, pitfall 107): "Use `log.debug()` only for
// server-side scripts", with `console.log()` for client scripts.
// Tier 4 (platform behavior): `console` runs in a server script, but its output goes
// nowhere, so only N/log produces logs there. This is a convention, not a runtime failure.
// Only a module positively inferred as a server script is checked: a library or a mixed
// module may be shared with client scripts, where `console` is correct.
const LOG_LEVEL: Record<string, string> = {
  debug: "debug",
  error: "error",
  info: "audit",
  log: "debug",
  warn: "audit",
};

export const noServerConsole = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const callee = node.callee;
    if (callee?.kind !== "JS_STATIC_MEMBER_EXPRESSION") return;
    const [object, member] = callee.children();
    if (object?.text !== "console" || !member) return;
    const level = LOG_LEVEL[member.text];
    if (!level || scriptSide(node) !== "server") return;
    registerDiagnostic(
      node,
      "warning",
      `console.${member.text}() output goes nowhere in server scripts; use log.${level}() instead.`,
    );
  },
});
