import {
  type AnyJsAstNode,
  ast,
  defineRule,
  registerDiagnostic,
} from "@biomejs/runtime/plugin";
import { pairs, parseDefine } from "../lib/define.ts";

const FUNCTIONS = [
  "JS_FUNCTION_EXPRESSION",
  "JS_ARROW_FUNCTION_EXPRESSION",
  "JS_FUNCTION_DECLARATION",
  "JS_METHOD_OBJECT_MEMBER",
  "JS_METHOD_CLASS_MEMBER",
];

const FACTORIES = /\.(createColumn|createFilter|createSort|createSetting)$/;

// Oracle's SAFE guide: "All N/ API modules are unavailable during the `define()`
// callback execution. Calling `runtime.getCurrentScript()`, `record.load()`, or
// any N/ API at module scope causes deployment failure." Initialize lazily from an
// entry point instead. N/log is exempt because log is a global. The failure claim
// comes only from this skill and has not been checked against Oracle's
// documentation, and its examples are calls that do work (getCurrentScript, record.load).
// Unverified: docs/verification/contradictions.md, C-011.
// Calls that only build an object (`search.createColumn`, `createFilter`,
// `createSort`, `createSetting`) are skipped, because nothing says they fail; remove
// them from FACTORIES if that turns out to be wrong.
export const noModuleScopeApiCalls = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const def = parseDefine(node);
    if (!def?.body) return;
    const aliases = new Set(
      pairs(def)
        .filter((d) => d.name?.startsWith("N/") && d.name !== "N/log")
        .map((d) => d.param?.text),
    );
    const visit = (n: AnyJsAstNode): void => {
      if (FUNCTIONS.includes(n.kind)) return;
      if (n.kind === "JS_CALL_EXPRESSION") {
        const callee = n.children()[0];
        const object =
          callee?.kind === "JS_STATIC_MEMBER_EXPRESSION"
            ? callee.children()[0]?.text
            : undefined;
        if (
          object &&
          aliases.has(object) &&
          !FACTORIES.test(callee?.text ?? "")
        ) {
          registerDiagnostic(
            n,
            "error",
            `${callee?.text}() runs at module scope; call it from an entry point.`,
          );
        }
      }
      for (const child of n.children()) visit(child);
    };
    for (const child of def.body.children()) visit(child);
  },
});
