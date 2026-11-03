// Options Oracle documents that @hitc/netsuite-types does not list yet. The
// generated data adds them so noUnknownOptions does not report valid code. Each
// entry cites Oracle's page; remove it once the typings have the option (the typings
// test fails when one is no longer needed).
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
