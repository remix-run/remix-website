import * as React from "react";
import { useLoaderData } from "remix";
import cx from "clsx";

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
    <PrefetchMarkdownLinks>
      <div
        ref={ref}
        onClick={handleClickForPreTags}
        className={cx("markdown", {
          "has-toc": doc.toc,
        })}
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
      <div className="h-[90vh]" />
    </PrefetchMarkdownLinks>
  );
};

export { DocsPage };

// This implicitly relies on the docs.css file for the icon and the copyable data attribute:
// <div onClick={handleClickForPreTags}>
//   <div>won't copy me</div>
//   <pre data-copyable>
//     <code>can copy me</code>
//   </pre>
// </div>
async function handleClickForPreTags(event: React.MouseEvent<HTMLElement>) {
  if (!(event.target instanceof HTMLElement)) return;
  let pre = event.target.closest("pre");
  if (!(pre instanceof HTMLPreElement)) return; // not in a pre
  if ("nocopy" in pre.dataset) return; // not a copyable pre
  if (!("lang" in pre.dataset)) return; // no language specified
  if (!pre.textContent) return; // no content to copy

  if (window.getSelection()?.toString() !== "") return; // wanted to select something

  let computedStyle = window.getComputedStyle(pre);
  let rect = pre.getBoundingClientRect();
  let clickX = Number.parseInt(computedStyle.left, 10) + event.pageX;
  let clickY = Number.parseInt(computedStyle.top, 10) + event.pageY;
  let preTop = rect.top + document.documentElement.scrollTop;
  let preLeft = rect.left + document.documentElement.scrollLeft;
  let preRight = preLeft + rect.width;
  // the icon is 36x36 away from the top right corner. If they clicked around
  // there, we can assume they wanted to copy.
  let clickedTopRightCorner = clickX > preRight - 36 && clickY < preTop + 36;
  if (!clickedTopRightCorner) return; // didn't click the copy icon

  await navigator.clipboard.writeText(pre.textContent.trim());
  pre.dataset.copied = "true";
  setTimeout(() => {
    delete pre?.dataset.copied;
  }, 1000);
}
