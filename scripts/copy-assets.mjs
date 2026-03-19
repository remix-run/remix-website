import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

let root = join(dirname(fileURLToPath(import.meta.url)), "..");
let jamImagesSrc = join(root, "remix/assets/jam/images");
let jamImagesDest = join(root, "public/assets/jam/images");
let iconsSrc = join(root, "remix/shared/icons.svg");
let iconsDest = join(root, "public/icons.svg");

if (existsSync(jamImagesSrc)) {
  mkdirSync(dirname(jamImagesDest), { recursive: true });
  cpSync(jamImagesSrc, jamImagesDest, { recursive: true });
}

cpSync(iconsSrc, iconsDest);
