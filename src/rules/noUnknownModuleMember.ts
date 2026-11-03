import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { moduleOfAlias } from "../lib/module-calls.ts";
import { TYPINGS } from "../lib/typings-data.ts";

const IGNORED = ["default", "prototype", "constructor", "__esModule"];

// Reading something the type definitions (Tier 2) do not export from an N/ module
// (`record.loadRecord`) gives undefined or throws at runtime. The module is
// resolved from the define() or import binding of the receiver. Modules that
// re-export everything are skipped because their exports cannot be listed, and the
// definitions can lag a release, so a member Oracle added recently may be reported.
export const noUnknownModuleMember = defineRule({
  query: ast("JS_STATIC_MEMBER_EXPRESSION"),
  run(node) {
    const [object, member] = node.children();
    if (object?.kind !== "JS_IDENTIFIER_EXPRESSION" || !member) return;
    const module = moduleOfAlias(node, object.text);
    const exports = module && TYPINGS[module]?.exports;
    if (
      exports &&
      !exports.includes(member.text) &&
      !IGNORED.includes(member.text)
    ) {
      registerDiagnostic(
        member,
        "error",
        `${module} has no export '${member.text}'.`,
      );
    }
  },
});
