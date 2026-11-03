// Native Biome rules the configs turn on because an Oracle source asks for what
// they check (see docs/rule-priority.md). Biome's own recommended rules are enabled
// in every config as well, but only these are listed in the README.
export const NATIVE_RULES = [
  {
    group: "security",
    name: "noGlobalEval",
    presets: ["recommended", "all"],
    severity: "error",
  },
  {
    group: "nursery",
    name: "noImpliedEval",
    presets: ["recommended", "all"],
    severity: "error",
  },
  { group: "security", name: "noSecrets", presets: ["all"], severity: "warn" },
  { group: "suspicious", name: "noVar", presets: ["all"], severity: "warn" },
  { group: "style", name: "useConst", presets: ["all"], severity: "warn" },
  { group: "style", name: "useTemplate", presets: ["all"], severity: "warn" },
  { group: "nursery", name: "useIncludes", presets: ["all"], severity: "warn" },
  { group: "style", name: "useForOf", presets: ["all"], severity: "warn" },
] as const;
