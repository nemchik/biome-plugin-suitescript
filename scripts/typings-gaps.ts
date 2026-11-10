// Things Oracle documents that @hitc/netsuite-types does not list yet (a typings
// gap). The generated data adds them so the rules do not report valid code. Each
// entry cites Oracle's page; remove it once the typings have the option or member
// (the typings test fails when one is no longer needed). The option list is empty
// while the typings cover every option Oracle documents.

/** Options of a function that the typings lack (an option gap). */
export interface Gap {
  module: string;
  fn: string;
  options: string[];
  source: string;
}

const HELP = "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/";

export const GAPS: Gap[] = [];

/** A module member that the typings lack (a member gap). */
export interface ExportGap {
  module: string;
  name: string;
  source: string;
}

export const EXPORT_GAPS: ExportGap[] = [
  {
    // C-009 (docs/verification/contradictions.md)
    module: "N/util",
    name: "isAsyncFunction",
    source: `${HELP}section_159485198809.html`,
  },
];
