import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const biomeBin = fileURLToPath(
  new URL("../node_modules/@biomejs/biome/bin/biome", import.meta.url),
);

/** Formats generated files with the repo's Biome config so `biome ci` stays green. */
export function formatWithBiome(...files: string[]): void {
  execFileSync(process.execPath, [biomeBin, "check", "--write", ...files], {
    stdio: "inherit",
  });
}
