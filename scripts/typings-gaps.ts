// Options Oracle documents that @hitc/netsuite-types does not list yet. The
// generated data adds them so noUnknownOptions does not report valid code. Each
// entry cites Oracle's page; remove it once the typings have the option (the typings
// test fails when one is no longer needed). The list is empty while the typings
// cover every option Oracle documents.
export interface Gap {
  module: string;
  fn: string;
  options: string[];
  source: string;
}

export const GAPS: Gap[] = [];
