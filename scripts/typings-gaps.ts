// Things Oracle documents that @hitc/netsuite-types does not list yet (a typings
// gap). The generated data adds them so the rules do not report valid code. Each
// entry cites Oracle's page; remove it once the typings have the option or member
// (the typings test fails when one is no longer needed). The render options are
// proposed upstream in
// https://github.com/headintheclouddev/typings-suitescript-2.0/pull/382.

/** Options of a function that the typings lack (an option gap). */
export interface Gap {
  module: string;
  fn: string;
  options: string[];
  source: string;
}

const HELP = "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/";

export const GAPS: Gap[] = [
  {
    fn: "pickingTicket",
    module: "N/render",
    options: ["inCustLocale"],
    source: `${HELP}section_456921936034.html`,
  },
  {
    fn: "packingSlip",
    module: "N/render",
    options: ["inCustLocale"],
    source: `${HELP}section_458625732421.html`,
  },
  {
    fn: "bom",
    module: "N/render",
    options: ["inCustLocale"],
    source: `${HELP}section_457552429198.html`,
  },
];

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
