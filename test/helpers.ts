import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const biomeBin = join(root, "node_modules/@biomejs/biome/bin/biome");

/** Lints a fixture the way a consumer would: the built package installed in node_modules. */
export function lint(
  plugins: string[],
  fixture: string,
  extend: string[] = [],
  pluginsOnly = true,
): string {
  const dir = mkdtempSync(join(tmpdir(), "bps-"));
  mkdirSync(join(dir, "node_modules/@biomejs"), { recursive: true });
  symlinkSync(
    root,
    join(dir, "node_modules/biome-plugin-suitescript"),
    "junction",
  );
  symlinkSync(
    join(root, "node_modules/@biomejs/runtime"),
    join(dir, "node_modules/@biomejs/runtime"),
    "junction",
  );
  writeFileSync(
    join(dir, "biome.json"),
    JSON.stringify({
      extends: extend.map((name) => `biome-plugin-suitescript/configs/${name}`),
      linter: { enabled: true },
      plugins,
    }),
  );
  cpSync(join(root, "test/fixtures", fixture), join(dir, fixture));
  const r = spawnSync(
    process.execPath,
    [biomeBin, "lint", ...(pluginsOnly ? ["--only=plugin"] : []), fixture],
    {
      cwd: dir,
      encoding: "utf8",
    },
  );
  return r.stdout + r.stderr;
}

export const ALL = ["biome-plugin-suitescript/presets/all"];
export const rule = (...names: string[]) =>
  names.map((name) => `biome-plugin-suitescript/${name}`);
export const count = (out: string) => (out.match(/plugin ━/g) ?? []).length;
