import * as esbuild from "esbuild";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

let root = join(dirname(fileURLToPath(import.meta.url)), "..");
let outfile = join(root, "build/server/index.js");
mkdirSync(dirname(outfile), { recursive: true });

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ["remix/server.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  outfile,
  logLevel: "info",
});
