import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

// Oracle's OWASP skill: uploads are stored in restricted folders and
// `isOnline: false // Not publicly accessible by default`; its bad example sets
// `fileObj.isOnline = true; // Publicly accessible!`. LOW CONFIDENCE, so no preset
// includes it: public assets legitimately set isOnline.
export const noPublicFileUpload = defineRule({
  query: ast("JS_PROPERTY_OBJECT_MEMBER", "JS_ASSIGNMENT_EXPRESSION"),
  run(node) {
    const [target, value] = node.children();
    const name =
      node.kind === "JS_ASSIGNMENT_EXPRESSION"
        ? target?.kind === "JS_STATIC_MEMBER_ASSIGNMENT"
          ? target.children()[1]?.text
          : undefined
        : target?.text;
    if (name === "isOnline" && value?.text === "true") {
      registerDiagnostic(
        value,
        "warning",
        "isOnline: true makes the file publicly accessible.",
      );
    }
  },
});
