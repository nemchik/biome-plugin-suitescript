import { ast, defineRule, registerDiagnostic } from "@biomejs/runtime/plugin";

const MEMBERS: Record<string, string[]> = {
  CacheDuration: ["LONG", "MEDIUM", "SHORT", "UNIQUE"],
  Encoding: [
    "UTF_8",
    "BASE_16",
    "BASE_32",
    "BASE_64",
    "BASE_64_URL_SAFE",
    "HEX",
  ],
  HashAlg: ["SHA256", "SHA512"],
  Method: ["DELETE", "GET", "HEAD", "PUT", "POST", "PATCH"],
  RedirectType: ["MEDIA_ITEM", "RECORD", "RESTLET", "SUITELET", "TASK_LINK"],
};

// The member lists match the type definitions (N/http.d.ts, N/encode.d.ts and
// N/crypto.d.ts) and Oracle's enumeration pages.
// Oracle (N/https enumerations): "this error is thrown if an enum is misspelled
// within a script. For example, you see this error if you use
// http.RedirectType.TASKLINK instead of http.RedirectType.TASK_LINK". A misspelled
// member is undefined, which fails the required-option check at runtime.
export const noInvalidHttpsEnumMember = defineRule({
  query: ast("JS_STATIC_MEMBER_EXPRESSION"),
  run(node) {
    const match = /^https\.(\w+)\.(\w+)$/.exec(node.text);
    const allowed = match?.[1] && MEMBERS[match[1]];
    if (allowed && match?.[2] && !allowed.includes(match[2])) {
      registerDiagnostic(
        node,
        "error",
        `${match[2]} is not a member of https.${match[1]}.`,
      );
    }
  },
});
