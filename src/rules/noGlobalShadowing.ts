import {
  type AnyJsAstNode,
  ast,
  defineRule,
  registerDiagnostic,
} from "@biomejs/runtime/plugin";
import { dependencies } from "../lib/biome-modules.ts";
import { parseDefine } from "../lib/define.ts";

// Oracle's upgrade skill: not renaming `log` or `util` "shadows SS2.1 globals and
// can break logging or utility calls" (listed as `error` in its SKILL.md).
// `log` and `util` are SuiteScript 2.1 globals. The one allowed binding is the
// module they come from: N/log as `log`, N/util as `util`. `error` is not listed
// because moduleVars names the N/error identifier `error`.
const GLOBALS: Record<string, string> = { log: "N/log", util: "N/util" };

function isModuleBinding(node: AnyJsAstNode, module: string): boolean {
  const ancestors = node.ancestors();
  for (const ancestor of ancestors) {
    if (ancestor.kind === "JS_CALL_EXPRESSION") {
      const def = parseDefine(ancestor);
      if (!def) continue;
      const index = def.params.findIndex((p) => p?.text === node.text);
      const isParameter = ancestors.some(
        (a) => a.kind === "JS_FORMAL_PARAMETER",
      );
      const name = def.elements[index]?.text.slice(1, -1);
      return isParameter && index >= 0 && name === module;
    }
    if (ancestor.kind === "JS_IMPORT") {
      return dependencies(ancestor).some((d) => d.name === module);
    }
  }
  return false;
}

export const noGlobalShadowing = defineRule({
  query: ast("JS_IDENTIFIER_BINDING"),
  run(node) {
    const module = GLOBALS[node.text];
    if (module && !isModuleBinding(node, module)) {
      registerDiagnostic(
        node,
        "error",
        `'${node.text}' shadows the global ${node.text}.`,
      );
    }
  },
});
