import { processMarkdown } from "@ryanflorence/md";
import type { Prisma } from "@prisma/client";
import invariant from "ts-invariant";

import { prisma } from "../../db.server";
import { processDocs } from "./process-doc";
import { findMatchingEntries, getPackage } from "@mcansh/undoc";

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

  let entries = await findMatchingEntries(stream, "/docs");
  let entriesWithProcessedMD = await processDocs(entries);

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

  // check if we have this release already
  let release = await prisma.gitHubRef.findUnique({
    where: { ref },
  });

  // release exists already, so we need to update it
  if (release) {
    // delete all the docs for that release
    // this way if we deleted one, it's gone
    let deleted = await prisma.doc.deleteMany({
      where: { githubRef: { ref } },
    });

    console.info(`> Deleted ${deleted.count} docs from ${ref}`);

    let result = await prisma.gitHubRef.update({
      where: { ref },
      data: {
        docs: { create: docsToCreate },
      },
      select: {
        ref: true,
        docs: { select: { id: true } },
      },
    });

    console.info(
      `> Updated release for version: ${result.ref} with ${result.docs.length} docs`
    );
  } else {
    let result = await prisma.gitHubRef.create({
      data: {
        ref,
        releaseNotes: await processMarkdown(releaseNotes),
        docs: { create: docsToCreate },
      },
      select: {
        ref: true,
        docs: { select: { id: true } },
      },
    });

    console.info(
      `> Created release for version: ${result.ref} with ${result.docs.length} docs`
    );
  }
}

export { saveDocs };
