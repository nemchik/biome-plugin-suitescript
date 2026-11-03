import {
  defineRule,
  registerDiagnostic,
  semantic,
} from "@biomejs/runtime/plugin";
import { moduleOfReceiver, typingsOf } from "../lib/module-calls.ts";

// A member the type definitions (Tier 2) do not list for a module enum
// (`record.Type.CUSTOMR`) evaluates to undefined, which then fails a required
// option at runtime. The enum's module is resolved from the define() or import
// binding of the receiver.
export const noInvalidEnumMember = defineRule({
  query: semantic("JS_STATIC_MEMBER_EXPRESSION"),
  run(node, { model }) {
    const [object, member] = node.children();
    if (object?.kind !== "JS_STATIC_MEMBER_EXPRESSION" || !member) return;
    const [receiver, enumName] = object.children();
    if (!receiver || !enumName) return;
    const enums = typingsOf(moduleOfReceiver(receiver, model))?.enums;
    const members =
      enums && Object.hasOwn(enums, enumName.text)
        ? enums[enumName.text]
        : undefined;
    if (members && !members.includes(member.text)) {
      registerDiagnostic(
        member,
        "warning",
        `${member.text} is not a member of ${receiver.text}.${enumName.text}.`,
      );
    }
  },
});
