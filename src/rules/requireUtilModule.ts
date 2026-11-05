import {
  defineRule,
  registerDiagnostic,
  semantic,
} from "@biomejs/runtime/plugin";
import { inSuiteScriptModule } from "../lib/suitescript.ts";

// Tier 0: docs/adr/0006-suitescript-globals-have-two-opposite-loading-styles.md.
// Load N/util when you call util.*. Oracle's upgrade skill (references/conversion-guide.md)
// says "`log` and `util` are global objects in SS2.1; you can use them without
// adding to define(). However, explicitly including `N/log` makes dependencies
// clearer", and its SKILL.md recommends loading N/log for that reason. The skill names
// only N/log; this rule applies the same recommendation to `util`, so it is a
// convention (`warn`, in `all`). The help center's "NetSuite loads the util Object ...
// by default for all script types. You do not need to load it manually" is why
// noMissingModules leaves `util` alone. This is the opposite style to noUtilModule,
// so enable only one of them.
export const requireUtilModule = defineRule({
  query: semantic("JS_REFERENCE_IDENTIFIER"),
  run(node, { model }) {
    if (node.text !== "util" || model.binding(node)) return;
    const member = node.parent?.parent;
    if (
      member?.kind !== "JS_STATIC_MEMBER_EXPRESSION" ||
      member.children()[0]?.text !== "util"
    )
      return;
    if (!inSuiteScriptModule(node)) return;
    registerDiagnostic(
      node,
      "warning",
      "'util' is used but N/util is not loaded.",
    );
  },
});
