// Reads the N/ declaration files of @hitc/netsuite-types and extracts, for every
// loadable module, what a lint rule can check without types: the options each
// module-level function takes, its enums and its runtime exports.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSync } from "oxc-parser";
import { MODULES } from "../src/lib/modules.ts";
import type { Alternative, Typings } from "../src/lib/typings.ts";
import { GAPS } from "./typings-gaps.ts";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const typesDir = join(root, "node_modules/@hitc/netsuite-types/N");

// biome-ignore lint/suspicious/noExplicitAny: oxc's AST is large and untyped here
type Node = any;

interface Shape {
  required: Set<string>;
  known: Set<string>;
  open: boolean;
}

interface FileInfo {
  interfaces: Map<string, Node>;
  aliases: Map<string, Node>;
  enums: Map<string, string[]>;
  values: Map<string, Node>;
  /** Every overload of a declared function, in order. */
  functionDecls: Map<string, Node[]>;
  kinds: Map<string, "type" | "value">;
  exportedNames: string[];
  exportedValues: string[];
  reexports: boolean;
  reexportSpecs: { source: string; local: string; exported: string }[];
}

const keyName = (key: Node): string | undefined =>
  key?.type === "Identifier"
    ? key.name
    : key?.type === "Literal" && typeof key.value === "string"
      ? key.value
      : undefined;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.name.endsWith(".d.ts") ? [path] : [];
  });
}

function readFile(path: string): FileInfo {
  const source = readFileSync(path, "utf8");
  const { program } = parseSync(path, source, {
    lang: "ts",
    sourceType: "module",
  });
  const info: FileInfo = {
    aliases: new Map(),
    enums: new Map(),
    exportedNames: [],
    exportedValues: [],
    functionDecls: new Map(),
    interfaces: new Map(),
    kinds: new Map(),
    reexportSpecs: [],
    reexports: false,
    values: new Map(),
  };
  const declare = (node: Node, exported: boolean) => {
    switch (node?.type) {
      case "TSInterfaceDeclaration":
        info.interfaces.set(node.id.name, node);
        info.kinds.set(node.id.name, "type");
        break;
      case "TSTypeAliasDeclaration":
        info.aliases.set(node.id.name, node.typeAnnotation);
        info.kinds.set(node.id.name, "type");
        break;
      case "TSEnumDeclaration": {
        const members = (node.body?.members ?? node.members ?? []).map(
          (m: Node) => keyName(m.id),
        );
        info.enums.set(node.id.name, members.filter(Boolean));
        info.kinds.set(node.id.name, "value");
        if (exported) info.exportedValues.push(node.id.name);
        break;
      }
      case "VariableDeclaration":
        for (const d of node.declarations) {
          if (d.id?.type !== "Identifier") continue;
          info.values.set(d.id.name, d.id.typeAnnotation?.typeAnnotation);
          info.kinds.set(d.id.name, "value");
          if (exported) info.exportedValues.push(d.id.name);
        }
        break;
      case "FunctionDeclaration":
      case "TSDeclareFunction":
        if (node.id) {
          info.functionDecls.set(node.id.name, [
            ...(info.functionDecls.get(node.id.name) ?? []),
            node,
          ]);
          info.values.set(node.id.name, node);
          info.kinds.set(node.id.name, "value");
          if (exported) info.exportedValues.push(node.id.name);
        }
        break;
      case "ClassDeclaration":
      case "TSModuleDeclaration":
        if (node.id?.name) {
          info.kinds.set(node.id.name, "value");
          if (exported) info.exportedValues.push(node.id.name);
        }
        break;
      default:
    }
  };
  const specifiers: { local: string; exported: string }[] = [];
  for (const item of program.body as Node[]) {
    if (item.type === "ExportNamedDeclaration") {
      if (item.declaration) {
        declare(item.declaration, true);
        const name = item.declaration.id?.name;
        if (name) info.exportedNames.push(name);
      }
      for (const s of item.specifiers ?? []) {
        const spec = {
          exported: keyName(s.exported) ?? "",
          local: keyName(s.local) ?? "",
        };
        if (item.source)
          info.reexportSpecs.push({ ...spec, source: item.source.value });
        else specifiers.push(spec);
      }
    } else if (
      item.type === "ExportAllDeclaration" ||
      item.type === "TSExportAssignment"
    ) {
      info.reexports = true;
    } else {
      declare(
        item.type === "ExportDefaultDeclaration" ? undefined : item,
        false,
      );
    }
  }
  for (const s of specifiers) {
    info.exportedNames.push(s.exported);
    if (
      info.kinds.get(s.local) === "value" &&
      !info.exportedValues.includes(s.exported)
    ) {
      info.exportedValues.push(s.exported);
      if (s.local !== s.exported) {
        const value = info.values.get(s.local);
        if (value) info.values.set(s.exported, value);
        const members = info.enums.get(s.local);
        if (members) info.enums.set(s.exported, members);
      }
    }
  }
  return info;
}

/** The properties of a type, or undefined when they cannot be worked out. */
function shapesOf(
  type: Node,
  file: FileInfo,
  all: Map<string, FileInfo>,
  seen = new Set<string>(),
): Shape[] | undefined {
  if (!type) return undefined;
  switch (type.type) {
    case "TSTypeAnnotation":
      return shapesOf(type.typeAnnotation, file, all, seen);
    case "TSParenthesizedType":
      return shapesOf(type.typeAnnotation, file, all, seen);
    case "TSTypeLiteral":
      return [shapeOfMembers(type.members, file, all, seen)].filter(
        Boolean,
      ) as Shape[];
    case "TSUnionType": {
      const out: Shape[] = [];
      for (const member of type.types) {
        if (
          member.type === "TSUndefinedKeyword" ||
          member.type === "TSNullKeyword"
        )
          continue;
        const shapes = shapesOf(member, file, all, seen);
        if (!shapes) return undefined;
        out.push(...shapes);
      }
      return out;
    }
    case "TSIntersectionType": {
      let combined: Shape[] = [
        { known: new Set(), open: false, required: new Set() },
      ];
      for (const member of type.types) {
        const shapes = shapesOf(member, file, all, seen);
        if (!shapes) return undefined;
        combined = combined.flatMap((a) =>
          shapes.map((b) => ({
            known: new Set([...a.known, ...b.known]),
            open: a.open || b.open,
            required: new Set([...a.required, ...b.required]),
          })),
        );
      }
      return combined;
    }
    case "TSTypeReference": {
      const name =
        type.typeName?.type === "Identifier" ? type.typeName.name : undefined;
      if (!name) return undefined;
      const args: Node[] = type.typeArguments?.params ?? [];
      if (name === "Omit" || name === "Partial" || name === "Required") {
        const inner = shapesOf(args[0], file, all, seen);
        if (!inner) return undefined;
        if (name === "Partial")
          return inner.map((s) => ({ ...s, required: new Set<string>() }));
        if (name === "Required")
          return inner.map((s) => ({ ...s, required: new Set(s.known) }));
        const dropped = new Set<string>();
        const collect = (t: Node): boolean => {
          if (
            t?.type === "TSLiteralType" &&
            typeof t.literal?.value === "string"
          ) {
            dropped.add(t.literal.value);
            return true;
          }
          if (t?.type === "TSUnionType") return t.types.every(collect);
          return false;
        };
        if (!collect(args[1])) return undefined;
        return inner.map((s) => ({
          known: new Set([...s.known].filter((k) => !dropped.has(k))),
          open: s.open,
          required: new Set([...s.required].filter((k) => !dropped.has(k))),
        }));
      }
      if (args.length > 0) return undefined;
      if (seen.has(name)) return undefined;
      const nextSeen = new Set(seen).add(name);
      const owner = [file, ...all.values()].find(
        (f) => f.interfaces.has(name) || f.aliases.has(name),
      );
      if (!owner) return undefined;
      const iface = owner.interfaces.get(name);
      if (iface) {
        const own = shapeOfMembers(iface.body.body, owner, all, nextSeen);
        if (!own) return undefined;
        let result: Shape[] = [own];
        for (const parent of iface.extends ?? []) {
          const parentName = parent.expression?.name;
          if (!parentName || parent.typeArguments) return undefined;
          const parents = shapesOf(
            {
              type: "TSTypeReference",
              typeName: { name: parentName, type: "Identifier" },
            },
            owner,
            all,
            nextSeen,
          );
          if (!parents) return undefined;
          result = result.flatMap((a) =>
            parents.map((b) => ({
              known: new Set([...a.known, ...b.known]),
              open: a.open || b.open,
              required: new Set([...a.required, ...b.required]),
            })),
          );
        }
        return result;
      }
      return shapesOf(owner.aliases.get(name), owner, all, nextSeen);
    }
    default:
      return undefined;
  }
}

function shapeOfMembers(
  members: Node[],
  file: FileInfo,
  all: Map<string, FileInfo>,
  seen: Set<string>,
): Shape | undefined {
  const shape: Shape = { known: new Set(), open: false, required: new Set() };
  for (const member of members) {
    if (member.type === "TSIndexSignature") {
      shape.open = true;
    } else if (member.type === "TSPropertySignature") {
      const name = keyName(member.key);
      if (!name || member.computed) {
        shape.open = true;
        continue;
      }
      shape.known.add(name);
      if (!member.optional) shape.required.add(name);
    }
  }
  void file;
  void all;
  void seen;
  return shape;
}

/** The call shapes (parameter lists) of an exported function or function-typed constant. */
function signaturesOf(name: string, file: FileInfo): Node[][] | undefined {
  const overloads = file.functionDecls.get(name);
  if (overloads) return overloads.map((fn) => fn.params);
  const value = file.values.get(name);
  if (!value) return undefined;
  if (value.type === "TSFunctionType") return [value.params];
  if (
    value.type === "TSTypeReference" &&
    value.typeName?.type === "Identifier"
  ) {
    const iface = file.interfaces.get(value.typeName.name);
    if (!iface) return undefined;
    const calls = iface.body.body.filter(
      (m: Node) => m.type === "TSCallSignatureDeclaration",
    );
    return calls.length > 0 ? calls.map((c: Node) => c.params) : undefined;
  }
  return undefined;
}

function alternativesOf(
  params: Node[],
  file: FileInfo,
  all: Map<string, FileInfo>,
): Alternative[] | 0 {
  const first = params[0];
  if (first?.type !== "Identifier") return 0;
  const shapes = shapesOf(first.typeAnnotation, file, all);
  if (!shapes || shapes.length === 0) return 0;
  return shapes.map((s) => {
    const alt: Alternative = [[...s.required].sort(), [...s.known].sort()];
    if (s.open) alt.push(1);
    return alt;
  });
}

export function extractTypings(applyGaps = true): Typings {
  const files = new Map<string, FileInfo>();
  for (const path of walk(typesDir)) {
    const name = `N/${relative(typesDir, path)
      .replaceAll("\\", "/")
      .replace(/\.d\.ts$/, "")}`;
    files.set(name, readFile(path));
  }
  // `export { get } from './http'` brings the other module's declarations along.
  for (const [name, file] of files) {
    for (const spec of file.reexportSpecs) {
      const target = files.get(
        `N/${join(dirname(name.slice(2)), spec.source).replaceAll("\\", "/")}`,
      );
      if (target?.kinds.get(spec.local) !== "value") continue;
      file.exportedValues.push(spec.exported);
      const value = target.values.get(spec.local);
      if (value) {
        file.values.set(spec.exported, value);
        const overloads = target.functionDecls.get(spec.local);
        if (overloads) file.functionDecls.set(spec.exported, overloads);
        for (const [key, iface] of target.interfaces)
          file.interfaces.set(key, iface);
        for (const [key, alias] of target.aliases) file.aliases.set(key, alias);
      }
      const members = target.enums.get(spec.local);
      if (members) file.enums.set(spec.exported, members);
    }
  }
  const out: Typings = {};
  for (const module of Object.keys(MODULES).sort()) {
    const file = files.get(module);
    if (!file) continue;
    const functions: Record<string, Alternative[] | 0> = {};
    for (const name of file.exportedValues) {
      if (file.enums.has(name)) continue;
      const signatures = signaturesOf(name, file);
      if (!signatures) continue;
      const alternatives = signatures.map((params) =>
        alternativesOf(params, file, files),
      );
      functions[name] = alternatives.includes(0)
        ? 0
        : (alternatives.flat() as Alternative[]);
    }
    const enums: Record<string, string[]> = {};
    for (const name of file.exportedValues) {
      const members = file.enums.get(name);
      if (members) enums[name] = [...members].sort();
    }
    out[module] = {
      enums,
      ...(file.reexports
        ? {}
        : { exports: [...new Set(file.exportedValues)].sort() }),
      functions,
    };
  }
  if (applyGaps) {
    for (const gap of GAPS) {
      const alternatives = out[gap.module]?.functions[gap.fn];
      if (!alternatives) continue;
      for (const alternative of alternatives) {
        alternative[1] = [
          ...new Set([...alternative[1], ...gap.options]),
        ].sort();
      }
    }
  }
  return out;
}
