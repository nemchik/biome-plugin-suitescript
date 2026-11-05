import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

const SECRET_NAMES =
  /^(password|passwd|pwd|secret|api_?key|client_?secret|token_?secret|consumer_?secret)$/i;

const unquote = (text: string): string => text.replace(/^['"]|['"]$/g, "");

// Tier 0: docs/adr/0005-guessing-rules-are-in-no-preset.md.
// Oracle: "Don't hard-code any passwords in scripts." The OWASP skill agrees, but
// its `SKILL.md` shows script parameters as the safe place while its
// references/02 says script parameters are not a secret store and points to API
// Secrets. `SKILL.md` outranks the reference; the message follows the reference
// because it is the more precise advice (docs/verification/contradictions.md,
// C-002, not testable). A heuristic on names, so
// no preset includes it; enable it explicitly. Only exact secret-like names with
// a non-empty string literal are flagged (not `passwordId` or `tokenName`).
export const noHardcodedSecrets = defineRule({
  query: ast(
    "JS_VARIABLE_DECLARATOR",
    "JS_PROPERTY_OBJECT_MEMBER",
    "JS_ASSIGNMENT_EXPRESSION",
  ),
  run(node) {
    const children = node.children();
    let name: string | undefined;
    let value: (typeof children)[number] | undefined;
    if (node.kind === "JS_VARIABLE_DECLARATOR") {
      name = children.find((c) => c.kind === "JS_IDENTIFIER_BINDING")?.text;
      value = children
        .find((c) => c.kind === "JS_INITIALIZER_CLAUSE")
        ?.children()[0];
    } else if (node.kind === "JS_PROPERTY_OBJECT_MEMBER") {
      name = children[0] && unquote(children[0].text);
      value = children[1];
    } else {
      const target = children[0];
      name =
        target?.kind === "JS_STATIC_MEMBER_ASSIGNMENT"
          ? target.children()[1]?.text
          : target?.text;
      value = children[1];
    }
    if (
      name &&
      SECRET_NAMES.test(name) &&
      value?.kind === "JS_STRING_LITERAL_EXPRESSION" &&
      value.text.length > 2
    ) {
      registerDiagnostic(
        value,
        "error",
        `Do not hard-code '${name}'; use an API Secret (https.createSecureString) instead of source code.`,
      );
    }
  },
});
