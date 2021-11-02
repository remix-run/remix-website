import path from "path";

import { getLatestRefFromParam } from "@mcansh/undoc";
import { Doc } from "@prisma/client";
import { prisma } from "~/db.server";
import invariant from "ts-invariant";

export async function getDoc(
  slug: string,
  paramRef: string,
  lang: string
): Promise<Doc> {
  let refs = await prisma.gitHubRef.findMany();
  let ref = await getLatestRefFromParam(
    paramRef,
    refs.map((r) => r.ref)
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
