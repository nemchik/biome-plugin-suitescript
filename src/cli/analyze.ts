// Node-only analysis of a single SuiteScript source file (ESTree via oxc-parser).
import {
  type ArrowFunctionExpression,
  type Comment,
  type ExportNamedDeclaration,
  type Expression,
  type Function as FunctionNode,
  type ObjectExpression,
  type Program,
  parseSync,
} from "oxc-parser";
import {
  declaredProblems,
  inferredProblems,
  inferScriptType,
  typeByName,
} from "../lib/inference.ts";
import { misplacedModule, sideOf } from "../lib/module-script-types.ts";

const API_VERSION = "2.1";
const UPGRADABLE = new Set(["1.0", "2.0", "2.x"]);

export interface Diagnostic {
  rule: "apiVersion" | "scriptType" | "entryPoints" | "modules" | "parse";
  message: string;
  line: number;
  column: number;
}

export interface Analysis {
  diagnostics: Diagnostic[];
  /** True when an old @NApiVersion was found, so the upgrade hint applies. */
  upgrade: boolean;
}

type Callback = FunctionNode | ArrowFunctionExpression;

function isCallback(node: { type: string } | undefined): node is Callback {
  return (
    node?.type === "FunctionExpression" ||
    node?.type === "ArrowFunctionExpression"
  );
}

function objectNames(object: ObjectExpression): string[] | undefined {
  const names: string[] = [];
  for (const property of object.properties) {
    if (property.type === "SpreadElement") return undefined;
    const key = property.key;
    if (key.type === "Identifier") names.push(key.name);
    else if (key.type === "Literal") names.push(String(key.value));
  }
  return names;
}

function unwrap(
  node: Expression | null | undefined,
): Expression | null | undefined {
  let current = node;
  while (current?.type === "ParenthesizedExpression")
    current = current.expression;
  return current;
}

function amdReturnedNames(callback: Callback): string[] | undefined {
  const body = callback.body;
  if (!body) return undefined;
  let returned: Expression | null | undefined;
  let statements: Program["body"] = [];
  if (body.type === "BlockStatement") {
    statements = body.body;
    const ret = statements.find((s) => s.type === "ReturnStatement");
    returned =
      ret?.type === "ReturnStatement" ? unwrap(ret.argument) : undefined;
  } else {
    returned = unwrap(body);
  }
  if (!returned) return [];
  if (returned.type === "ObjectExpression") return objectNames(returned);
  if (returned.type !== "Identifier") return undefined;

  const variable = returned.name;
  const names: string[] = [];
  for (const statement of statements) {
    if (statement.type === "VariableDeclaration") {
      for (const declarator of statement.declarations) {
        const init = unwrap(declarator.init);
        if (
          declarator.id.type === "Identifier" &&
          declarator.id.name === variable &&
          init?.type === "ObjectExpression"
        ) {
          const found = objectNames(init);
          if (!found) return undefined;
          names.push(...found);
        }
      }
    } else if (
      statement.type === "ExpressionStatement" &&
      statement.expression.type === "AssignmentExpression"
    ) {
      const left = statement.expression.left;
      if (
        left.type === "MemberExpression" &&
        !left.computed &&
        left.object.type === "Identifier" &&
        left.object.name === variable &&
        left.property.type === "Identifier"
      ) {
        names.push(left.property.name);
      }
    }
  }
  return names;
}

function exportedNames(node: ExportNamedDeclaration): string[] {
  const names: string[] = [];
  const declaration = node.declaration;
  if (declaration?.type === "FunctionDeclaration" && declaration.id) {
    names.push(declaration.id.name);
  }
  if (declaration?.type === "VariableDeclaration") {
    for (const d of declaration.declarations) {
      if (d.id.type === "Identifier") names.push(d.id.name);
    }
  }
  for (const specifier of node.specifiers) {
    const exported = specifier.exported;
    names.push(
      exported.type === "Identifier" ? exported.name : String(exported.value),
    );
  }
  return names;
}

interface Inspection {
  isScript: boolean;
  /** `N/` modules loaded through define() or import. */
  modules: string[];
  /** Undefined when the returned entry points cannot be determined statically. */
  returned: string[] | undefined;
}

function inspectProgram(program: Program): Inspection {
  let isScript = false;
  const modules: string[] = [];
  const returned: string[] = [];
  let opaque = false;
  // Only trust `returned` when an inline define() callback or ES syntax was seen;
  // factory references and UMD wrappers cannot be analysed statically.
  let known = false;
  for (const node of program.body) {
    if (
      node.type === "ImportDeclaration" ||
      node.type === "ExportNamedDeclaration"
    )
      known = true;
    if (
      node.type === "ImportDeclaration" &&
      /^N(\/|$)/.test(node.source.value)
    ) {
      isScript = true;
      modules.push(node.source.value);
    }
    if (node.type === "ExportNamedDeclaration")
      returned.push(...exportedNames(node));
    if (
      node.type === "ExpressionStatement" &&
      node.expression.type === "CallExpression"
    ) {
      const call = node.expression;
      if (call.callee.type === "Identifier" && call.callee.name === "define") {
        isScript = true;
        const dependencies = call.arguments.at(-2);
        if (dependencies?.type === "ArrayExpression") {
          for (const element of dependencies.elements) {
            if (
              element?.type === "Literal" &&
              typeof element.value === "string"
            )
              modules.push(element.value);
          }
        }
        const callback = call.arguments.at(-1);
        if (isCallback(callback)) {
          const names = amdReturnedNames(callback);
          if (names) {
            returned.push(...names);
            known = true;
          } else {
            opaque = true;
          }
        } else {
          opaque = true;
        }
      }
    }
  }
  return {
    isScript,
    modules,
    returned: opaque || !known ? undefined : returned,
  };
}

interface Tag {
  value: string | undefined;
  offset: number;
}

function findTag(comments: Comment[], name: string): Tag | undefined {
  const pattern = new RegExp(`${name}(?:[ \\t]+(\\S+))?`);
  for (const comment of comments) {
    if (comment.type !== "Block") continue;
    const match = pattern.exec(comment.value);
    if (match)
      return { offset: comment.start + 2 + match.index, value: match[1] };
  }
  return undefined;
}

function locator(
  source: string,
): (offset: number) => { line: number; column: number } {
  const starts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\n") starts.push(i + 1);
  }
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if ((starts[mid] ?? 0) <= offset) lo = mid;
      else hi = mid - 1;
    }
    return { column: offset - (starts[lo] ?? 0) + 1, line: lo + 1 };
  };
}

/**
 * Analyzes one file. Libraries (no tags, no implied entry points) produce no
 * diagnostics.
 */
export function analyzeSource(filename: string, source: string): Analysis {
  const diagnostics: Diagnostic[] = [];
  const at = locator(source);
  const report = (rule: Diagnostic["rule"], message: string, offset = 0) => {
    diagnostics.push({ message, rule, ...at(offset) });
  };

  const parsed = parseSync(filename, source);
  const fatal = parsed.errors.find((e) => e.severity === "Error");
  if (fatal && parsed.program.body.length === 0) {
    report("parse", `Could not parse file: ${fatal.message}`);
    return { diagnostics, upgrade: false };
  }

  const apiVersion = findTag(parsed.comments, "@NApiVersion");
  const scriptType = findTag(parsed.comments, "@NScriptType");
  const { isScript, modules, returned } = inspectProgram(parsed.program);
  const inferred = isScript && returned ? inferScriptType(returned) : undefined;

  // Not a script: no tags and nothing that implies an entry point.
  if (!apiVersion && !scriptType && !inferred)
    return { diagnostics, upgrade: false };

  let upgrade = false;
  if (apiVersion) {
    if (!apiVersion.value) {
      report(
        "apiVersion",
        "No @NApiVersion value provided.",
        apiVersion.offset,
      );
    } else if (apiVersion.value !== API_VERSION) {
      upgrade = UPGRADABLE.has(apiVersion.value);
      report(
        "apiVersion",
        `@NApiVersion must be ${API_VERSION}, found '${apiVersion.value}'.`,
        apiVersion.offset,
      );
    }
  } else {
    report("apiVersion", `Missing @NApiVersion ${API_VERSION} tag.`);
  }

  let declared: string | undefined;
  if (scriptType) {
    if (!scriptType.value) {
      report(
        "scriptType",
        "No @NScriptType value provided.",
        scriptType.offset,
      );
    } else if (!typeByName(scriptType.value)) {
      report(
        "scriptType",
        `Invalid @NScriptType value '${scriptType.value}'.`,
        scriptType.offset,
      );
    } else {
      declared = scriptType.value;
    }
  } else if (inferred?.types.length) {
    const names = inferred.types.map((t) => t.name).join(" or ");
    report(
      "scriptType",
      `Missing @NScriptType tag; the returned entry points imply ${names}.`,
    );
  }

  if (returned) {
    const problems = declared
      ? declaredProblems(declared, returned)
      : inferredProblems(returned);
    for (const message of problems)
      report("entryPoints", message, scriptType?.offset ?? 0);
  }

  // The declared type wins; otherwise fall back to what the entry points imply.
  const declaredType = declared ? typeByName(declared) : undefined;
  const side = sideOf(declaredType ? [declaredType] : (inferred?.types ?? []));
  if (side) {
    for (const module of modules) {
      const message = misplacedModule(side, module);
      if (message) report("modules", message, scriptType?.offset ?? 0);
    }
  }
  return { diagnostics, upgrade };
}
