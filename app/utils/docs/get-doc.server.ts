import path from "path";

import { getRefFromParam } from "@mcansh/undoc";
import type { Doc } from "@prisma/client";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";
import { getBranchOrTagFromRef } from "./get-tag-from-ref.server";
import { json } from "@remix-run/node";

invariant(process.env.REPO_LATEST_BRANCH, "REPO_LATEST_BRANCH is not set");

export async function getDoc(
  slug: string,
  paramRef: string,
  lang: string
): Promise<Doc> {
  let refs = await prisma.gitHubRef.findMany();
  let ref = getRefFromParam(
    paramRef,
    refs.map((r) => getBranchOrTagFromRef(r.ref)),
    process.env.REPO_LATEST_BRANCH!
  );

  if (!ref) {
    throw json(`No ref found for ${paramRef}`, { status: 404 });
  }

  let doc: Doc;
  let slugs = [path.join("/", `${slug}.md`), path.join("/", slug, "index.md")];
  try {
    doc = await prisma.doc.findFirst({
      where: {
        OR: [
          {
            githubRef: { ref },
            lang,
            filePath: {
              in: slugs,
            },
          },
          {
            githubRef: { ref },
            lang: "en",
            filePath: {
              in: slugs,
            },
          },
        ],
      },
      rejectOnNotFound: true,
    });
  } catch (error: unknown) {
    console.error(error);
    for (const slug of slugs) {
      console.error(`Failed to find doc for slug "${slug}" for ${ref}`);
    }
    throw json("Doc not found", { status: 404 });
  }

  return doc;
}
