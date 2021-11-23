import { satisfies } from "semver";
import { installGlobals } from "@remix-run/node";

import { saveDocs } from "../app/utils/docs/save-docs.server";
import type { GitHubRelease } from "../app/@types/github";

installGlobals();

async function seed() {
  let releasesPromise = await fetch(
    `https://api.github.com/repos/${process.env.REPO}/releases`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );

  let releases = (await releasesPromise.json()) as GitHubRelease[];

  let releasesToUse = releases.filter((release) => {
    return satisfies(release.tag_name, ">=1.0.0-rc.4", {
      includePrerelease: true,
    });
  });

  let promises: Promise<void>[] = [
    saveDocs("refs/heads/main", ""),
    // saveDocs("refs/heads/dev", ""),
  ];

  for (let release of releasesToUse) {
    promises.push(saveDocs(`refs/tags/${release.tag_name}`, release.body));
  }

  await Promise.all(promises);
}

try {
  seed();
} catch (error) {
  throw error;
}
