import {
  type AnyJsAstNode,
  ast,
  defineRule,
  registerDiagnostic,
} from "@biomejs/runtime/plugin";
import { callArguments } from "../lib/options.ts";

// A define() call has one of four shapes, and its last argument is the factory:
// define(factory), define(deps, factory), define(name, factory) or
// define(name, deps, factory). Arguments that cannot be judged statically
// (identifiers, calls) are accepted; only a literal of the wrong kind is flagged.
const NAME = "JS_STRING_LITERAL_EXPRESSION";
const DEPS = "JS_ARRAY_EXPRESSION";
const LITERALS = [
  NAME,
  DEPS,
  "JS_NUMBER_LITERAL_EXPRESSION",
  "JS_BOOLEAN_LITERAL_EXPRESSION",
  "JS_NULL_LITERAL_EXPRESSION",
];

const wrongLiteral = (node: AnyJsAstNode | undefined, ...allowed: string[]) =>
  !!node && LITERALS.includes(node.kind) && !allowed.includes(node.kind);

export const noInvalidDefine = defineRule({
  query: ast("JS_CALL_EXPRESSION"),
  run(node) {
    if (node.callee?.text !== "define") return;
    const args = callArguments(node);
    const factory = args[args.length - 1];
    let problem: string | undefined;
    if (args.length === 0) {
      problem = "define() needs a factory.";
    } else if (args.length > 3) {
      problem =
        "define() takes at most a name, a dependency array and a factory.";
    } else if (wrongLiteral(factory)) {
      problem = "The define() factory must be a function or an object.";
    } else if (args.length === 2 && wrongLiteral(args[0], NAME, DEPS)) {
      problem =
        "The first define() argument must be a dependency array or a name.";
    } else if (
      args.length === 3 &&
      (wrongLiteral(args[0], NAME) || wrongLiteral(args[1], DEPS))
    ) {
      problem =
        "define(name, dependencies, factory) needs a string name and a dependency array.";
    }
    if (problem) registerDiagnostic(node, "error", problem);
  },
});
