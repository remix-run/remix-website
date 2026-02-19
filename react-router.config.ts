import type { Config } from "@react-router/dev/config";
import { writeFile, mkdir } from "node:fs/promises";

export default {
  future: {
    unstable_optimizeDeps: true,
    v8_middleware: true,
    v8_viteEnvironmentApi: true,
    v8_splitRouteModules: true,
  },
  async buildEnd() {
    await mkdir("build/server/.vite", { recursive: true });
    await writeFile(
      "build/server/.vite/manifest.json",
      JSON.stringify({}, null, 2),
      "utf-8",
    );
  },
} satisfies Config;
