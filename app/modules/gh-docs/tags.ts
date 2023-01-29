import LRUCache from "lru-cache";
import parseLinkHeader from "parse-link-header";
import semver from "semver";
import invariant from "tiny-invariant";
import { octokit } from "./github";

invariant(
  process.env.RELEASE_VERSION_BASIS_PACKAGE,
  "RELEASE_VERSION_BASIS_PACKAGE is not set"
);
const RELEASE_VERSION_BASIS_PACKAGE = process.env.RELEASE_VERSION_BASIS_PACKAGE;

/**
 * Fetches the repo tags
 */
export async function getTags(repo: string) {
  return tagsCache.fetch(repo);
}

export function getLatestVersion(tags: string[]) {
  return tags.filter((tag) =>
    semver.satisfies(tag, "*", { includePrerelease: false })
  )[0];
}

declare global {
  var tagsCache: LRUCache<string, string[]>;
}

// global for SS "HMR", we need a better story here
global.tagsCache ??= new LRUCache<string, string[]>({
  // let tagsCache = new LRUCache<string, string[]>({
  max: 3,
  ttl: 1000 * 60 * 5, // 5 minutes, so we can see new tags quickly
  allowStale: true,
  noDeleteOnFetchRejection: true,
  fetchMethod: async (key) => {
    console.log("Fetching fresh tags (releases)");
    let [owner, repo] = key.split("/");
    return getAllReleases(owner, repo, RELEASE_VERSION_BASIS_PACKAGE);
  },
});

// TODO: implementation details of the remix site leaked into here cause I'm in
// a hurry now, sorry!
export async function getAllReleases(
  owner: string,
  repo: string,
  primaryPackage: string,
  page = 1,
  releases: string[] = []
): Promise<string[]> {
  console.log("Fetching fresh releases, page", page);
  let { data, headers, status } = await octokit.rest.repos.listReleases({
    mediaType: { format: "json" },
    owner,
    repo,
    per_page: 100,
    page,
  });

  if (status !== 200) {
    throw new Error(`Failed to fetch releases: ${data}`);
  }

  releases.push(
    ...data
      .filter((release) => {
        return Boolean(
          // Check the release name
          /^v[0-9]/.test(release?.name || "") ||
            // ideally all we care about is release.name, but we have some old
            // releases that don't have that set, so we check the tag name too
            // After changesets, we look for remix@<VERSION>
            release.tag_name.split("@")[0] === primaryPackage ||
            // pre-changesets, tag_name started with "v"
            /^v[0-9]/.test(release.tag_name)
        );
      })
      .map((release) => {
        return (
          // pre-changesets, tag_name started with "v"
          /^v[0-9]/.test(release.tag_name)
            ? release.tag_name
            : // with changesets its like remix@<VERSION>
              release.tag_name.split("@")[1] || "unknown"
        );
      })
  );

  let parsed = parseLinkHeader(headers.link);
  if (parsed?.next) {
    return await getAllReleases(
      owner,
      repo,
      primaryPackage,
      page + 1,
      releases
    );
  }

  return releases;
}
