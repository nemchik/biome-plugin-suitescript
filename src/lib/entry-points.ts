import type { AnyJsAstNode } from "@biomejs/runtime/plugin";
import { objectNames } from "./biome-modules.ts";
import type { ParsedDefine } from "./define.ts";

function unwrap(node: AnyJsAstNode | undefined): AnyJsAstNode | undefined {
  let current = node;
  while (current?.kind === "JS_PARENTHESIZED_EXPRESSION")
    current = current.children()[0];
  return current;
}

/**
 * Names returned by a define() callback, or undefined when they cannot be
 * determined statically (spreads, calls, conditionals).
 */
export function amdReturnedNames(def: ParsedDefine): string[] | undefined {
  if (!def.body) return undefined;
  let statements: readonly AnyJsAstNode[] = [];
  let returned: AnyJsAstNode | undefined;
  if (def.body.kind === "JS_FUNCTION_BODY") {
    statements =
      def.body
        .children()
        .find((c) => c.kind === "JS_STATEMENT_LIST")
        ?.children() ?? [];
    returned = unwrap(
      statements.find((s) => s.kind === "JS_RETURN_STATEMENT")?.children()[0],
    );
  } else {
    returned = unwrap(def.body);
  }

  if (returned?.kind === "JS_OBJECT_EXPRESSION") {
    const { names, opaque } = objectNames(returned);
    return opaque ? undefined : names;
  }
  if (returned?.kind !== "JS_IDENTIFIER_EXPRESSION")
    return returned ? undefined : [];

  // `const o = {...}; o.pageInit = ...; return o;`
  const variable = returned.text;
  const names: string[] = [];
  for (const s of statements) {
    if (s.kind === "JS_VARIABLE_STATEMENT") {
      const declarators = s.children()[0]?.children()[0]?.children() ?? [];
      for (const d of declarators) {
        const id = d.children().find((c) => c.kind === "JS_IDENTIFIER_BINDING");
        const initializer = d
          .children()
          .find((c) => c.kind === "JS_INITIALIZER_CLAUSE");
        const init = unwrap(initializer?.children()[0]);
        if (id?.text === variable && init?.kind === "JS_OBJECT_EXPRESSION") {
          const { names: found, opaque } = objectNames(init);
          if (opaque) return undefined;
          names.push(...found);
        }
      }
    } else if (s.kind === "JS_EXPRESSION_STATEMENT") {
      const assign = s.children()[0];
      const target =
        assign?.kind === "JS_ASSIGNMENT_EXPRESSION"
          ? assign.children()[0]
          : undefined;
      if (target?.kind === "JS_STATIC_MEMBER_ASSIGNMENT") {
        const [object, property] = target.children();
        if (object?.text === variable && property) names.push(property.text);
      }
    }
  }
  return names;
}
