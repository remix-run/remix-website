import { getDoc, getMenu } from "./docs";
import { getBranches } from "./branches";
import { getLatestVersion, getTags } from "./tags";
import invariant from "tiny-invariant";
import { env } from "~/env.server";

export { validateParams } from "./params";
export { getRepoTarballStream } from "./repo-tarball";
export { getLatestVersion, getAllReleases } from "./tags";

export type { Doc } from "./docs";

const REPO = env.SOURCE_REPO;
const RELEASE_PACKAGE = env.RELEASE_PACKAGE;

export function getRepoTags() {
  return getTags(REPO);
}

export function getRepoBranches() {
  return getBranches(REPO);
}

export async function getLatestRepoTag(): Promise<string> {
  let tags = await getTags(REPO);
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
  return ref === "dev" ||
    ref === "main" ||
    ref === "local" ||
    // when we switched to changesets the `v` went away, so we use that as a way
    // to know if we need to add hte `remix@` prefix for interacting w/
    // github.
    ref.startsWith("v")
    ? ref
    : `${RELEASE_PACKAGE}@${ref}`;
}
