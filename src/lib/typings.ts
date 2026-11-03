// The shape of the data generated from @hitc/netsuite-types (see typings-data.ts).

/** One way to call a function: the options it requires and every option it knows. */
export type Alternative = [required: string[], known: string[], open?: 1];

export interface ModuleTypings {
  /** Function name to its call shapes; 0 when its options cannot be worked out. */
  functions: Record<string, Alternative[] | 0>;
  enums: Record<string, string[]>;
  /** Runtime exports, or undefined when the module re-exports everything (so it cannot be listed). */
  exports?: string[];
}

export type Typings = Record<string, ModuleTypings>;
