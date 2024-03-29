export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export function transformNpmCommand(
  prefix: string,
  cmd: string,
  packageManagerTarget: "yarn" | "bun" | "pnpm" | "npm",
) {
  if (prefix === "npm") {
    if (cmd.split(" ")[0] === "install" && packageManagerTarget === "yarn") {
      return `${packageManagerTarget} ${cmd.replace("install", "add")}`;
    }
    return `${packageManagerTarget} ${cmd}`;
  }
  switch (packageManagerTarget) {
    case "bun":
      return `bunx ${cmd}`;
    case "pnpm":
      return `pnpm dlx ${cmd}`;
  }
  return `${prefix} ${cmd}`;
}
