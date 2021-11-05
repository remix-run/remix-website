import path from "path";

import { getRefFromParam } from "@mcansh/undoc";
import { Doc } from "@prisma/client";
import invariant from "ts-invariant";

import { prisma } from "~/db.server";
import { getBranchOrTagFromRef } from "./get-tag-from-ref";

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

  invariant(ref, `No ref found for ${paramRef}`);

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
    console.error(
      `Failed to find doc for the following slugs: ${slugs.join(
        ", "
      )} for ${ref}`
    );
    throw new Response("", { status: 404, statusText: "Doc not found" });
  }

  return doc;
}
