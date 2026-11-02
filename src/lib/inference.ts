// Pure logic shared by the Biome rules and the CLI. No imports from Biome or Node.
import { SCRIPT_TYPES, type ScriptType } from "./script-types.ts";

export const ALL_ENTRY_POINTS = new Set(
  SCRIPT_TYPES.flatMap((t) => t.entryPoints),
);

// Names that commonly appear in ordinary library modules. A module that only
// returns these is not treated as a script, so libraries are never flagged.
export const GENERIC_ENTRY_POINTS = new Set([
  "get",
  "post",
  "put",
  "delete",
  "map",
  "reduce",
  "run",
  "render",
]);

export function typeByName(name: string): ScriptType | undefined {
  return SCRIPT_TYPES.find((t) => t.name.toLowerCase() === name.toLowerCase());
}

/** Extra requirements on top of "returns at least one entry point of the type". */
function missingRequired(type: ScriptType, names: string[]): string[] {
  if (type.name === "MapReduceScript") {
    const missing: string[] = [];
    if (!names.includes("getInputData")) missing.push("getInputData");
    if (!names.includes("map") && !names.includes("reduce"))
      missing.push("map or reduce");
    return missing;
  }
  return [];
}

export interface Inferred {
  known: string[];
  types: ScriptType[];
}

/**
 * Infers the script type from the entry points a module returns.
 *
 * Returns undefined for libraries (nothing distinctive returned). Otherwise
 * `types` are the script types that could own every known entry point; empty
 * `types` means the entry points are mixed.
 */
export function inferScriptType(returnedNames: string[]): Inferred | undefined {
  const known = [...new Set(returnedNames)].filter((n) =>
    ALL_ENTRY_POINTS.has(n),
  );
  if (!known.some((n) => !GENERIC_ENTRY_POINTS.has(n))) return undefined;
  const types = SCRIPT_TYPES.filter((t) =>
    known.every((n) => t.entryPoints.includes(n)),
  );
  return { known, types };
}

/** Problems with an inferred script type, as messages. Empty when valid. */
export function inferredProblems(returnedNames: string[]): string[] {
  const inferred = inferScriptType(returnedNames);
  if (!inferred) return [];
  if (inferred.types.length === 0) {
    return [
      `Entry points ${inferred.known.join(", ")} do not belong to a single script type.`,
    ];
  }
  const names = [...new Set(returnedNames)];
  const failures = inferred.types.map((type) => ({
    missing: missingRequired(type, names),
    type,
  }));
  if (failures.some((f) => f.missing.length === 0)) return [];
  const first = failures[0];
  return first
    ? [
        `${first.type.name} requires entry point ${first.missing.join(" and ")}.`,
      ]
    : [];
}

/** Problems with a script type declared by `@NScriptType`, given what is returned. */
export function declaredProblems(
  typeName: string,
  returnedNames: string[],
): string[] {
  const type = typeByName(typeName);
  if (!type || type.entryPoints.length === 0) return [];
  const names = [...new Set(returnedNames)];
  const foreign = names.filter(
    (n) =>
      ALL_ENTRY_POINTS.has(n) &&
      !type.entryPoints.includes(n) &&
      !GENERIC_ENTRY_POINTS.has(n),
  );
  const problems: string[] = [];
  if (foreign.length) {
    problems.push(
      `@NScriptType ${type.name} does not support returned entry point${foreign.length > 1 ? "s" : ""} ${foreign.join(", ")}.`,
    );
  }
  if (!names.some((n) => type.entryPoints.includes(n))) {
    if (!foreign.length)
      problems.push(`Return at least one valid ${type.name} entry point.`);
  } else {
    const missing = missingRequired(type, names);
    if (missing.length)
      problems.push(
        `${type.name} requires entry point ${missing.join(" and ")}.`,
      );
  }
  return problems;
}
