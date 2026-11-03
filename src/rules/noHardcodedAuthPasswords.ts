import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";
import { optionsObject, propertyValue, stringValue } from "../lib/options.ts";

const PASSWORD_OPTIONS: Record<string, string[]> = {
  changeEmail: ["password"],
  changePassword: ["currentPassword", "newPassword"],
};

// Oracle (SuiteScript security considerations): "Don't hard-code any passwords in
// scripts." and, for N/auth, "Be extremely careful when using the N/auth module to
// change an email or user password. Both the auth.changeEmail(options) and
// auth.changePassword(options) methods allow you to include a plaintext string for
// the password."
export const noHardcodedAuthPasswords = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    const match = /^auth\.(changePassword|changeEmail)(\.promise)?$/.exec(
      node.callee?.text ?? "",
    );
    const keys = match?.[1] && PASSWORD_OPTIONS[match[1]];
    const options = optionsObject(node);
    if (!keys || !options) return;
    for (const key of keys) {
      const value = propertyValue(options, key);
      if (value && stringValue(value)) {
        registerDiagnostic(
          value,
          "warning",
          `Do not hard-code the ${key} in a script.`,
        );
      }
    }
  },
});
