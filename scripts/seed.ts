import { satisfies, rcompare } from "semver";
import { installGlobals } from "@remix-run/node";

import { saveDocs } from "../app/utils/docs/save-docs.server";
import type { GitHubRelease } from "../app/@types/github";
import invariant from "ts-invariant";

installGlobals();

async function seed() {
  invariant(
    process.env.REPO_LATEST_BRANCH,
    "REPO_LATEST_BRANCH is not defined"
  );

  let releasesPromise = await fetch(
    `https://api.github.com/repos/${process.env.REPO}/releases`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );

  let releases = (await releasesPromise.json()) as GitHubRelease[];

  let sortedReleases = releases
    .map((release) => release.tag_name)
    .sort((a, b) => rcompare(a, b));

  let latestRelease = sortedReleases.at(0);

  invariant(latestRelease, "latest release is not defined");

  let releasesToUse = releases.filter((release) => {
    return satisfies(release.tag_name, `>=${latestRelease}`, {
      includePrerelease: true,
    });
  });

  let promises: Promise<void>[] = [];

  for (let release of releasesToUse) {
    promises.unshift(saveDocs(`refs/tags/${release.tag_name}`, release.body));
  }

  await Promise.all(promises);
  await saveDocs(process.env.REPO_LATEST_BRANCH, "");
}

try {
  seed();
} catch (error) {
  throw error;
}
