import { getRefFromParam } from "@mcansh/undoc";
import { json } from "remix";
import invariant from "ts-invariant";

import { prisma } from "~/db.server";
import { getBranchOrTagFromRef } from "./get-tag-from-ref.server";

invariant(process.env.REPO_LATEST_BRANCH, "REPO_LATEST_BRANCH is not set");

export interface MenuNode {
  title: string;
  slug: string;
  hasContent: boolean;
  disabled: boolean;
  order: number | null;
  children: MenuNode[];
}

export async function getMenu(
  versionOrBranchParam: string,
  lang: string
): Promise<MenuNode[]> {
  let refs = await prisma.gitHubRef.findMany({
    select: { ref: true },
  });

  let ref = await getRefFromParam(
    versionOrBranchParam,
    refs.map((r) => getBranchOrTagFromRef(r.ref)),
    process.env.REPO_LATEST_BRANCH!
  );

  if (!ref) {
    throw json(`No ref found for ${versionOrBranchParam}`, 404);
  }

  let [localizedDocs, englishDocs] = await Promise.all([
    lang === "en"
      ? []
      : prisma.doc.findMany({
          where: {
            lang,
            githubRef: { ref },
          },
        }),
    prisma.doc.findMany({
      where: {
        lang: "en",
        githubRef: { ref },
      },
    }),
  ]);

  let mergedDocs = englishDocs.map((doc) => {
    let localizedDoc = localizedDocs.find((ld) => ld.filePath === doc.filePath);
    if (localizedDoc) {
      return localizedDoc;
    }
    return doc;
  });

  let sluggedDocs = [];

  // first pass we figure out the slugs
  for (let doc of mergedDocs) {
    if (doc.hidden) continue;
    let slug = doc.filePath.replace(/\.md$/, "");
    let isIndex = slug.endsWith("/index");
    if (isIndex) {
      slug = slug.slice(0, -6);
    }
    sluggedDocs.push({ slug, doc });
  }

  // sort so we can process parents before children
  sluggedDocs.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

  let tree: MenuNode[] = [];
  let map = new Map<string, MenuNode>();

  // second pass, we construct the hierarchy
  for (let { slug, doc } of sluggedDocs) {
    let node: MenuNode = {
      slug,
      title: doc.title,
      hasContent: doc.hasContent,
      order: doc.order,
      disabled: doc.disabled,
      children: [],
    };

    let parentSlug = slug.substring(0, slug.lastIndexOf("/"));
    map.set(slug, node);
    if (parentSlug) {
      let parent = map.get(parentSlug);
      invariant(parent, `Expected ${parentSlug} in tree`);
      parent.children.push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
}
