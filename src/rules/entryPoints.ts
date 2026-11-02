import {
  type AnyJsAstNode,
  ast,
  defineRule,
  registerDiagnostic,
} from "@biomejs/runtime/plugin";
import { esExportNames, importsNetSuite } from "../lib/biome-modules.ts";
import { parseDefine } from "../lib/define.ts";
import { amdReturnedNames } from "../lib/entry-points.ts";
import { inferredProblems } from "../lib/inference.ts";

// Infers the script type from the entry points a module returns and checks
// they belong to one type and that its required entry points are present.
// Modules that return no distinctive entry point (libraries) are ignored.
export const entryPoints = defineRule({
  query: ast("JS_CALL_EXPRESSION", "JS_MODULE"),
  run(node) {
    let names: string[] | undefined;
    let reportOn: AnyJsAstNode = node;
    if (node.kind === "JS_CALL_EXPRESSION") {
      const def = parseDefine(node);
      if (!def) return;
      names = amdReturnedNames(def);
    } else {
      if (!importsNetSuite(node)) return;
      names = esExportNames(node);
      reportOn =
        node.children().find((c) => c.kind === "JS_MODULE_ITEM_LIST") ?? node;
    }
    if (!names) return;
    for (const message of inferredProblems(names)) {
      registerDiagnostic(reportOn, "error", message);
    }
  },
});
