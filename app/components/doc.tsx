import * as React from "react";
import { useLoaderData } from "remix";
import cx from "clsx";

import { AddCopyToCodeBlocks } from "./code-copy";
import {
  PrefetchMarkdownLinks,
  useDelegatedReactRouterLinks,
} from "~/components/delegate-links";
import type { Doc as PrismaDoc } from "@prisma/client";

export let meta = ({ data: doc }: { data?: PrismaDoc }) => {
  if (!doc) {
    return { title: "Not Found" };
  }

  return {
    title: "Remix | " + doc.title,
    description: doc.description,
  };
};

const DocsPage: React.VFC = () => {
  let doc = useLoaderData<PrismaDoc>();
  let ref = React.useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(ref);

  return (
    <AddCopyToCodeBlocks>
      <PrefetchMarkdownLinks>
        <div
          ref={ref}
          className={cx("markdown", {
            "has-toc": doc.toc,
          })}
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
        <div className="h-[90vh]" />
      </PrefetchMarkdownLinks>
    </AddCopyToCodeBlocks>
  );
};

export { DocsPage };
