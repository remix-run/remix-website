import type { GitHubRef, Prisma } from "@prisma/client";
import invariant from "ts-invariant";
import {
  findMatchingEntries,
  getPackage,
  getVersionHead,
  getVersions,
} from "@mcansh/undoc";

import { prisma } from "../../db.server";
import { processDoc } from "./process-doc";

const REPO = process.env.REPO as string;
const REPO_DOCS_PATH = process.env.REPO_DOCS_PATH as string;
const REPO_LATEST_BRANCH = process.env.REPO_LATEST_BRANCH as string;

if (!REPO || !REPO_DOCS_PATH || !REPO_LATEST_BRANCH) {
  throw new Error(
    "yo, you forgot something, missing of the following REPO, REPO_DOCS_PATH, REPO_LATEST_BRANCH"
  );
}

/**
 * ref: refs/tags/v6.0.0-beta.1
 * ref: refs/heads/dev
 */
async function saveDocs(ref: string, releaseNotes: string) {
  let stream = await getPackage(REPO, ref, {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });

  invariant(stream, "no stream");

  let githubRef: GitHubRef;

  let maybeRef = await prisma.gitHubRef.findUnique({
    where: { ref },
  });

  if (maybeRef) {
    githubRef = maybeRef;
  } else {
    githubRef = await prisma.gitHubRef.create({
      data: { ref, releaseNotes },
    });
    console.log(`> created release for ${ref}`);
  }

  let version: string;

  if (ref === process.env.REPO_LATEST_BRANCH) {
    let githubRefs = await prisma.gitHubRef.findMany({ select: { ref: true } });
    let refs = githubRefs.map((r) => r.ref);
    let versions = getVersions(refs);
    version = versions[0].version;
  } else {
    version = getVersionHead(githubRef.ref);
  }

  let entries = await findMatchingEntries(stream, "/docs");
  let entriesWithProcessedMD = await Promise.all(
    entries.map((entry) => processDoc(entry, version))
  );

  console.info(`> Found ${entries.length} docs in ${ref}`);

  // create a doc in the format that the db wants
  let docsToCreate: Prisma.DocCreateWithoutGithubRefInput[] =
    entriesWithProcessedMD.map((entry) => ({
      filePath: entry.path,
      html: entry.html,
      lang: entry.lang,
      md: entry.md,
      hasContent: entry.hasContent,
      title: entry.attributes.title,
      description: entry.attributes.description,
      disabled: entry.attributes.disabled,
      hidden: entry.attributes.hidden,
      order: entry.attributes.order,
      published: entry.attributes.published,
      siblingLinks: entry.attributes.siblingLinks,
      toc: entry.attributes.toc,
    }));

  // delete all docs for this version
  // TODO: only delete docs that are not in the new docs
  await prisma.doc.deleteMany({
    where: {
      githubRef: githubRef,
    },
  });

  // create the docs
  await prisma.gitHubRef.update({
    where: { ref: githubRef.ref },
    data: {
      docs: {
        create: docsToCreate,
      },
    },
  });
}

export { saveDocs };
