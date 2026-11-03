import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { moduleOfAlias } from "../lib/module-calls.ts";
import { TYPINGS } from "../lib/typings-data.ts";

// A member the type definitions (Tier 2) do not list for a module enum
// (`record.Type.CUSTOMR`) evaluates to undefined, which then fails a required
// option at runtime. The enum's module is resolved from the define() or import
// binding of the receiver.
export const noInvalidEnumMember = defineRule({
  query: ast("JS_STATIC_MEMBER_EXPRESSION"),
  run(node) {
    const [object, member] = node.children();
    if (object?.kind !== "JS_STATIC_MEMBER_EXPRESSION" || !member) return;
    const [receiver, enumName] = object.children();
    if (receiver?.kind !== "JS_IDENTIFIER_EXPRESSION" || !enumName) return;
    const module = moduleOfAlias(node, receiver.text);
    const members = module && TYPINGS[module]?.enums[enumName.text];
    if (members && !members.includes(member.text)) {
      registerDiagnostic(
        member,
        "warning",
        `${member.text} is not a member of ${receiver.text}.${enumName.text}.`,
      );
    }
  },
});
