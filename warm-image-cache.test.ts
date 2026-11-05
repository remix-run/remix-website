import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";
import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { getBlogPostListings } from "./app/data/blog.ts";

describe("warm-image-cache", () => {
  it("fills the production cache without production secrets, matching runtime cache keys", async (t) => {
    let cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), "warm-image-"));
    t.after(() => fs.rm(cacheDir, { recursive: true, force: true }));
    let slug = getBlogPostListings()[0]!.slug;

    // `docker build` has no runtime secrets, so run with only the variables the
    // Dockerfile sets. Importing anything that requires them (such as
    // app/router.ts) fails this run.
    let warm = () =>
      promisify(execFile)(
        process.execPath,
        ["--import", "remix/node-tsx", "warm-image-cache.ts", slug],
        {
          cwd: import.meta.dirname,
          env: {
            PATH: process.env.PATH,
            NODE_ENV: "production",
            ASSET_FILE_CACHE_DIR: cacheDir,
            ASSET_FILE_CACHE_KEY: "warm-image-cache-test",
          },
        },
      );

    await warm();
    let firstRun = await listFiles(cacheDir);
    expect(firstRun.length).toBeGreaterThan(0);

    // A second run must hit the cache for every image it transformed.
    await warm();
    expect(await listFiles(cacheDir)).toEqual(firstRun);
  });
});

async function listFiles(dir: string) {
  let entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
  let files = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        let file = path.join(entry.parentPath, entry.name);
        let { mtimeMs } = await fs.stat(file);
        return `${path.relative(dir, file)}@${mtimeMs}`;
      }),
  );
  return files.sort();
}
