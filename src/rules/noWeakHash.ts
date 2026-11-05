import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

// Tier 0: docs/adr/0005-guessing-rules-are-in-no-preset.md.
// Oracle's OWASP skill: "MD5 and SHA-1 are cryptographically broken" and "Use
// SHA-256 as the minimum hashing algorithm. MD5 and SHA-1 are broken and must
// never be used for security-sensitive operations." LOW CONFIDENCE, so no preset
// includes it: it cannot tell a security use from a vendor integration that
// requires MD5 or SHA-1. The type definitions (N/crypto.d.ts) and Oracle's page list only
// SHA256 and SHA512 in crypto.HashAlg, but a deployed RESTlet shows MD5 and SHA1 exist as
// members and that createHash rejects them with HASHING_ALGORITHM_IS_NO_LONGER_VALID
// (2026.2): docs/verification/results/crypto-hashalg.md, C-008.
export const noWeakHash = defineRule({
  query: ast("JS_STATIC_MEMBER_EXPRESSION"),
  run(node) {
    if (/(^|\.)HashAlg\.(MD5|SHA1)$/.test(node.text)) {
      registerDiagnostic(
        node,
        "warning",
        "MD5 and SHA-1 are broken; use SHA-256 or stronger for security-sensitive hashing.",
      );
    }
  },
});
