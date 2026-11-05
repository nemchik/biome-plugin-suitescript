import {
  type AnyJsAstNode,
  ast,
  defineRule,
  registerDiagnostic,
} from "@biomejs/runtime/plugin";
import { callArguments } from "../lib/options.ts";
import { inSuiteScriptModule } from "../lib/suitescript.ts";

// Tier 4 (SuiteScript-specific, opinionated): prefer the `util` type checks to the
// native patterns that do the same job. N/util offers isArray, isString, isNumber,
// isBoolean, isFunction, isAsyncFunction, isDate and isRegExp (Oracle's N/util
// module page, and the type definitions' N/util.d.ts, which omit isAsyncFunction).
// No source states that `util` is better; this is a house preference for one
// vocabulary of type checks, so it is `warn` and in `all` only.
// Verified at runtime (docs/verification/results/util-type-checks.md, NetSuite
// 2026.2): util.isString, isNumber and isBoolean also accept boxed values, so a
// `typeof` check differs from them for `new String('a')` (rare in practice, and
// documented on the rule page); the Object.prototype.toString forms match exactly.
// isFunction is true for async functions, as `typeof x === 'function'` is.
// No rule covers isObject (no native pattern matches it, see
// docs/verification/results/util-isobject.md) or nanoTime.
// Flagged patterns:
//   Array.isArray(x), x instanceof Array, x.constructor === Array, toString.call(x) === '[object Array]'
//   typeof x === 'string' | 'number' | 'boolean' | 'function'
//   toString.call(x) === '[object String]' | '[object Number]' | '[object Boolean]'
//   x instanceof Date | RegExp, toString.call(x) === '[object Date]' | '[object RegExp]'
//   toString.call(x) === '[object AsyncFunction]', x.constructor.name === 'AsyncFunction',
//   x instanceof AsyncFunction (the usual name of the constructor)
const TYPEOF: Record<string, string> = {
  boolean: "isBoolean",
  function: "isFunction",
  number: "isNumber",
  string: "isString",
};
const TAGS: Record<string, string> = {
  Array: "isArray",
  AsyncFunction: "isAsyncFunction",
  Boolean: "isBoolean",
  Date: "isDate",
  Number: "isNumber",
  RegExp: "isRegExp",
  String: "isString",
};
const INSTANCEOF: Record<string, string> = {
  Array: "isArray",
  AsyncFunction: "isAsyncFunction",
  Date: "isDate",
  RegExp: "isRegExp",
};
const TO_STRING = /^(Object\.prototype\.|\{\}\.)?toString\.(call|apply)$/;
const EQUALITY = new Set(["===", "==", "!==", "!="]);

const unquote = (text: string): string => text.replace(/^['"`]|['"`]$/g, "");

/** An own entry of a table, so a key such as `constructor` finds nothing. */
const own = (
  table: Record<string, string>,
  key: string | undefined,
): string | undefined =>
  key !== undefined && Object.hasOwn(table, key) ? table[key] : undefined;

function stringLiteral(node: AnyJsAstNode | undefined): string | undefined {
  return node?.kind === "JS_STRING_LITERAL_EXPRESSION"
    ? unquote(node.text)
    : undefined;
}

/** The method `util` offers for a `typeof`/toString/constructor comparison, if the two sides are one. */
function comparison(
  one: AnyJsAstNode | undefined,
  other: AnyJsAstNode | undefined,
): string | undefined {
  const literal = stringLiteral(other);
  if (!one || literal === undefined) return undefined;
  if (one.kind === "JS_UNARY_EXPRESSION" && /^typeof\b/.test(one.text)) {
    return own(TYPEOF, literal);
  }
  if (one.kind === "JS_CALL_EXPRESSION") {
    if (!TO_STRING.test(one.callee?.text ?? "")) return undefined;
    const tag = /^\[object (\w+)\]$/.exec(literal)?.[1];
    return own(TAGS, tag);
  }
  const text = one.text.replace(/\s+/g, "");
  if (
    one.kind === "JS_STATIC_MEMBER_EXPRESSION" &&
    text.endsWith(".constructor.name")
  ) {
    return literal === "AsyncFunction" ? "isAsyncFunction" : undefined;
  }
  return undefined;
}

export const preferUtilTypeChecks = defineRule({
  query: ast(
    "JS_BINARY_EXPRESSION",
    "JS_CALL_EXPRESSION",
    "JS_INSTANCEOF_EXPRESSION",
  ),
  run(node) {
    let method: string | undefined;
    if (node.kind === "JS_CALL_EXPRESSION") {
      if (node.callee?.text !== "Array.isArray") return;
      if (callArguments(node).length !== 1) return;
      method = "isArray";
    } else if (node.kind === "JS_INSTANCEOF_EXPRESSION") {
      const right = node.right;
      if (right?.kind === "JS_IDENTIFIER_EXPRESSION") {
        method = own(INSTANCEOF, right.text);
      }
    } else {
      if (!EQUALITY.has(node.operatorToken ?? "")) return;
      const { left, right } = node;
      method = comparison(left, right) ?? comparison(right, left);
      if (
        !method &&
        left?.kind === "JS_STATIC_MEMBER_EXPRESSION" &&
        left.text.replace(/\s+/g, "").endsWith(".constructor") &&
        right?.text === "Array"
      ) {
        method = "isArray";
      }
    }
    if (!method || !inSuiteScriptModule(node)) return;
    const shown = node.text.replace(/\s+/g, " ");
    registerDiagnostic(
      node,
      "warning",
      `Use util.${method}() instead of \`${shown.length > 60 ? `${shown.slice(0, 57)}...` : shown}\`.`,
    );
  },
});
