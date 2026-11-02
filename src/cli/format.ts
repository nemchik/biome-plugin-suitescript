import type { Diagnostic } from "./analyze.ts";

const escapeData = (s: string): string =>
  s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const escapeProperty = (s: string): string =>
  escapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");

export const UPGRADE_HINT =
  "Upgrade old scripts with Oracle's netsuite-suitescript-upgrade agent skill (run /netsuite-suitescript-upgrade, starting with `analyze`): https://github.com/oracle/netsuite-suitecloud-sdk/tree/master/packages/agent-skills/netsuite-suitescript-upgrade";

export type OutputFormat = "text" | "json" | "github";

export interface FileResult {
  file: string;
  diagnostics: Diagnostic[];
}

const plural = (n: number, word: string): string =>
  `${n} ${word}${n === 1 ? "" : "s"}`;

/** Returns the text to print for the results of a run. */
export function format(
  kind: OutputFormat,
  results: FileResult[],
  { upgrade, files }: { upgrade: boolean; files: number },
): string {
  const all = results.flatMap((r) =>
    r.diagnostics.map((d) => ({ file: r.file, ...d })),
  );
  if (kind === "json") {
    return JSON.stringify(
      { diagnostics: all, files, hints: upgrade ? [UPGRADE_HINT] : [] },
      null,
      2,
    );
  }
  if (kind === "github") {
    return all
      .map(
        (d) =>
          `::error file=${escapeProperty(d.file)},line=${d.line},col=${d.column},title=${escapeProperty(`suitescript/${d.rule}`)}::${escapeData(d.message)}`,
      )
      .join("\n");
  }
  const lines = all.map(
    (d) => `${d.file}:${d.line}:${d.column}  ${d.rule}  ${d.message}`,
  );
  lines.push(
    all.length
      ? `\n${plural(all.length, "problem")} in ${plural(files, "checked file")}.`
      : `Checked ${plural(files, "file")}. No problems found.`,
  );
  if (upgrade) lines.push(`\n${UPGRADE_HINT}`);
  return lines.join("\n");
}
