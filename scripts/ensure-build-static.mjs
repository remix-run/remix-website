import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

let root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
mkdirSync(join(root, "build/static"), { recursive: true });
