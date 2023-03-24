import { getDoc, getMenu } from "./docs";
import { getBranches } from "./branches";
import { getLatestVersion, getTags } from "./tags";
import invariant from "tiny-invariant";
import type { Octokit } from "octokit";

export { validateParams } from "./params";
export { getRepoTarballStream } from "./repo-tarball";
export { getLatestVersion, getAllReleases } from "./tags";

export type { Doc } from "./docs";

invariant(process.env.SOURCE_REPO, "Missing process.env.SOURCE_REPO");
invariant(process.env.RELEASE_PACKAGE, "Missing process.env.RELEASE_PACKAGE");

const REPO = process.env.SOURCE_REPO;
const RELEASE_PACKAGE = process.env.RELEASE_PACKAGE;

export function getRepoTags({
  octokit,
  releasePackage,
}: {
  octokit: Octokit;
  releasePackage: string;
}) {
  return getTags(REPO, { octokit, releasePackage });
}

export function getRepoBranches({ octokit }: { octokit: Octokit }) {
  return getBranches(REPO, { octokit });
}

export async function getLatestRepoTag({
  octokit,
  releasePackage,
}: {
  octokit: Octokit;
  releasePackage: string;
}): Promise<string> {
  let tags = await getTags(REPO, { octokit, releasePackage });
  invariant(tags, "Expected tags in getLatestRepoTag");
  return getLatestVersion(tags);
}

export function getRepoDocsMenu(ref: string, lang: string) {
  return getMenu(REPO, fixupRefName(ref), lang);
}

export function getRepoDoc(ref: string, slug: string) {
  return getDoc(REPO, fixupRefName(ref), slug);
}

function fixupRefName(ref: string) {
  return ["dev", "main", "release-next", "local"].includes(ref) ||
    // when we switched to changesets the `v` went away, so we use that as a way
    // to know if we need to add hte `remix@` prefix for interacting w/
    // github.
    ref.startsWith("v")
    ? ref
    : `${RELEASE_PACKAGE}@${ref}`;
}
