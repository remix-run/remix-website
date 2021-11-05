import { satisfies } from "semver";
import { installGlobals } from "@remix-run/node";

import { saveDocs } from "../app/utils/docs/save-doc";
import type { GitHubRelease } from "../app/@types/github";

installGlobals();

async function seed() {
  let releasesPromise = await fetch(
    `https://api.github.com/repos/${process.env.REPO}/releases`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  let releases = (await releasesPromise.json()) as GitHubRelease[];

  const releasesToUse = releases.filter((release: any) => {
    return satisfies(release.tag_name, ">=0.20", { includePrerelease: true });
  });

  let promises: Promise<void>[] = [saveDocs("refs/heads/main", "")];

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