import type { GitHubRef, Prisma } from "@prisma/client";
import invariant from "ts-invariant";
import {
  findMatchingEntries,
  getPackage,
  getVersionHead,
  getVersions,
} from "@mcansh/undoc";

import { prisma } from "../../db.server";
import { processDoc, ProcessedDoc } from "./process-doc.server";

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
  let stream = await getPackage(REPO, ref);

  invariant(stream, "no stream");

  let githubRef: GitHubRef & { docs: { filePath: string; lang: string }[] };

  let maybeRef = await prisma.gitHubRef.findUnique({
    where: { ref },
    include: {
      docs: {
        select: { filePath: true, lang: true },
      },
    },
  });

  if (maybeRef) {
    githubRef = maybeRef;
  } else {
    githubRef = await prisma.gitHubRef.create({
      data: { ref, releaseNotes },
      include: {
        docs: {
          select: { filePath: true, lang: true },
        },
      },
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

  let existingDocs = githubRef.docs.map((doc) => doc.filePath);

  await findMatchingEntries(stream, "/docs", existingDocs, {
    async onEntry(entry) {
      let doc = await processDoc(entry, version);

      await upsertDoc(githubRef.ref, doc);
    },
    onDeletedEntries: async (deletedEntries) => {
      await prisma.doc.deleteMany({
        where: {
          filePath: {
            in: deletedEntries,
          },
          githubRef: {
            ref: githubRef.ref,
          },
        },
      });

      for (const doc of deletedEntries) {
        console.log(`> Deleted ${doc} for ${ref}`);
      }
    },
  });
}

async function upsertDoc(ref: string, doc: ProcessedDoc) {
  try {
    let updates: Prisma.DocCreateWithoutGithubRefInput = {
      filePath: doc.path,
      html: doc.html,
      lang: doc.lang,
      md: doc.md,
      hasContent: Boolean(doc.hasContent),
      title: doc.attributes.title,
      description: doc.attributes.description,
      disabled: Boolean(doc.attributes.disabled),
      hidden: Boolean(doc.attributes.hidden),
      order: doc.attributes.order,
      published: doc.attributes.published,
      siblingLinks: Boolean(doc.attributes.siblingLinks),
      toc: Boolean(doc.attributes.toc),
    };

    await prisma.doc.upsert({
      where: {
        filePath_githubRefId_lang: {
          filePath: doc.path,
          githubRefId: ref,
          lang: doc.lang,
        },
      },
      create: {
        ...updates,
        githubRef: {
          connect: {
            ref: ref,
          },
        },
      },
      update: updates,
    });

    console.log(`> Upserted ${doc.path} for ${ref}`);
  } catch (error) {
    console.error(error);
    console.error(`> Failed to upsert ${doc.path} for ${ref}`);
  }
}

export { saveDocs, upsertDoc };
