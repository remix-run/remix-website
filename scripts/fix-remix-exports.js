/**
 * Fixes the `remix` package's exports map after install.
 *
 * The preview/main branch build outputs files to `dist/` but the
 * package.json exports map references `dist/lib/`. This script
 * rewrites the paths to match the actual file locations.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const pkgPath = resolve("node_modules/remix/package.json");

try {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  let changed = false;

  for (const [key, value] of Object.entries(pkg.exports)) {
    if (typeof value === "object" && value !== null) {
      for (const [condition, path] of Object.entries(value)) {
        if (typeof path === "string" && path.includes("./dist/lib/")) {
          value[condition] = path.replace("./dist/lib/", "./dist/");
          changed = true;
        }
      }
    }
  }

  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log("Fixed remix package exports map (dist/lib/ -> dist/)");
  }
} catch (e) {
  // Don't fail the install if the package isn't present yet
  console.warn("Could not fix remix exports:", e.message);
}
