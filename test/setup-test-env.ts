import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

export function globalSetup() {
  loadEnvFileIfExists(".env");
  loadEnvFileIfExists(".env.test");
}

function loadEnvFileIfExists(path: string) {
  if (existsSync(path)) loadEnvFile(path);
}
