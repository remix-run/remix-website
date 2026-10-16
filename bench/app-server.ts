import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";

export interface AppServerOptions {
  /** Checkout to run `server.ts` from. */
  dir: string;
  port: number;
}

export interface AppServer {
  pid: number;
  origin: string;
  stop(): Promise<void>;
}

/**
 * Starts a checkout's production server the way the Dockerfile does. The
 * environment is built from scratch so shell values cannot leak into a run.
 * `app/utils/env.ts` still loads `.env` from the checkout, so compare clean
 * worktrees.
 */
export async function startAppServer({
  dir,
  port,
}: AppServerOptions): Promise<AppServer> {
  let child = spawn(
    process.execPath,
    ["--import", "remix/node-tsx", "server.ts"],
    {
      cwd: dir,
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        TMPDIR: process.env.TMPDIR,
        NODE_ENV: "production",
        MALLOC_ARENA_MAX: "2",
        PORT: String(port),
        CONVERTKIT_KEY: "bench",
      },
      stdio: ["ignore", "ignore", "pipe"],
    },
  );

  let stderr = "";
  child.stderr?.on("data", (chunk: Buffer) => {
    stderr += chunk.toString();
  });

  let origin = `http://127.0.0.1:${port}`;
  try {
    await waitForHealth(origin, child);
  } catch (error) {
    child.kill("SIGKILL");
    throw new Error(`App server in ${dir} failed to start.\n${stderr}`, {
      cause: error,
    });
  }

  return {
    pid: child.pid ?? 0,
    origin,
    stop: () => stopChild(child),
  };
}

async function waitForHealth(origin: string, child: ChildProcess) {
  let deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Exited with code ${child.exitCode}.`);
    }
    try {
      let response = await fetch(`${origin}/healthcheck`);
      if (response.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for /healthcheck.");
}

async function stopChild(child: ChildProcess) {
  if (child.exitCode !== null) return;
  let exited = once(child, "exit");
  child.kill("SIGTERM");
  let timeout = setTimeout(() => child.kill("SIGKILL"), 10_000);
  await exited;
  clearTimeout(timeout);
}
