// Helpers over Biome's JS plugin AST for AMD `define()` and ES `import`/`export`.
import type { AnyJsAstNode } from "@biomejs/runtime/plugin";
import { type Dependency, pairs, parseDefine } from "./define.ts";

const unquote = (text: string): string => text.replace(/^['"]|['"]$/g, "");

function moduleItems(moduleNode: AnyJsAstNode): readonly AnyJsAstNode[] {
  return (
    moduleNode
      .children()
      .find((c) => c.kind === "JS_MODULE_ITEM_LIST")
      ?.children() ?? []
  );
}

/** Dependencies declared by a node: a define() call or an `import` statement. */
export function dependencies(node: AnyJsAstNode): Dependency[] {
  if (node.kind === "JS_CALL_EXPRESSION") {
    const def = parseDefine(node);
    return def ? pairs(def) : [];
  }
  if (node.kind !== "JS_IMPORT") return [];
  const clause = node.children()[0];
  const source = clause?.children().find((c) => c.kind === "JS_MODULE_SOURCE");
  if (!clause || !source) return [];
  const isBinding =
    clause.kind === "JS_IMPORT_DEFAULT_CLAUSE" ||
    clause.kind === "JS_IMPORT_NAMESPACE_CLAUSE";
  const param = isBinding
    ? clause
        .children()[0]
        ?.children()
        .find((c) => c.kind === "JS_IDENTIFIER_BINDING")
    : undefined;
  return [{ name: source.text.slice(1, -1), nameNode: source, param }];
}

/** Whether an ES module imports at least one `N/` module (so it is SuiteScript). */
export function importsNetSuite(moduleNode: AnyJsAstNode): boolean {
  return moduleItems(moduleNode).some((item) =>
    dependencies(item).some((d) => d.name === "N" || d.name?.startsWith("N/")),
  );
}

function memberName(member: AnyJsAstNode): string | undefined {
  const name = member.children()[0]?.text;
  return name === undefined ? undefined : unquote(name);
}

/** Property names of an object literal; `opaque` when a spread hides some. */
export function objectNames(object: AnyJsAstNode): {
  names: string[];
  opaque: boolean;
} {
  const members = object.children()[0]?.children() ?? [];
  const names: string[] = [];
  let opaque = false;
  for (const m of members) {
    if (m.kind === "JS_SPREAD") {
      opaque = true;
    } else {
      const name = memberName(m);
      if (name) names.push(name);
    }
  }
  return { names, opaque };
}

/** Names exported by an ES module: `export const x`, `export function x`, `export { a as b }`. */
export function esExportNames(moduleNode: AnyJsAstNode): string[] {
  const names: string[] = [];
  for (const item of moduleItems(moduleNode)) {
    if (item.kind !== "JS_EXPORT") continue;
    const clause = item.children().find((c) => c.kind !== "JS_DECORATOR_LIST");
    if (!clause) continue;
    if (clause.kind === "JS_FUNCTION_DECLARATION") {
      const id = clause
        .children()
        .find((c) => c.kind === "JS_IDENTIFIER_BINDING");
      if (id) names.push(id.text);
    } else if (clause.kind === "JS_VARIABLE_DECLARATION_CLAUSE") {
      const declarators = clause.children()[0]?.children()[0]?.children() ?? [];
      for (const d of declarators) {
        const id = d.children().find((c) => c.kind === "JS_IDENTIFIER_BINDING");
        if (id) names.push(id.text);
      }
    } else if (clause.kind === "JS_EXPORT_NAMED_CLAUSE") {
      for (const specifier of clause.children()[0]?.children() ?? []) {
        const exported = specifier
          .children()
          .find((c) => c.kind === "JS_LITERAL_EXPORT_NAME");
        const name = exported
          ? unquote(exported.text)
          : specifier.children()[0]?.text;
        if (name) names.push(name);
      }
    }
  }
  return names;
}
