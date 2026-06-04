import type { Handle, RemixNode } from "remix/ui";

import type { DocsChapter as DocsChapterData } from "../../data/docs.server.ts";
import { routes } from "../../routes.ts";
import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { getSocialHeadTags } from "../../utils/social-head-tags.server.ts";
import { styleHrefs } from "../../utils/style-hrefs.ts";

export type DocsPageProps = {
  requestUrl: string;
};

export let docsResponseInit = {
  headers: {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  },
} satisfies ResponseInit;

export function DocsDocument(
  handle: Handle<{
    requestUrl: string;
    title: string;
    description: string;
    children: RemixNode;
  }>,
) {
  return () => {
    let title =
      handle.props.title === "Remix Docs"
        ? "Remix Docs"
        : `${handle.props.title} | Remix Docs`;

    return (
      <Document
        title={title}
        description={handle.props.description}
        stylesheets={[styleHrefs.app, styleHrefs.docs]}
        headTags={getSocialHeadTags({
          requestUrl: handle.props.requestUrl,
          title,
          description: handle.props.description,
        })}
      >
        <Header />
        <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
          {handle.props.children}
        </main>
        <Footer />
      </Document>
    );
  };
}

export function DocsChapterPage(
  handle: Handle<{
    requestUrl: string;
    chapter: DocsChapterData;
    previous?: DocsChapterData;
    next?: DocsChapterData;
  }>,
) {
  return () => (
    <DocsDocument
      requestUrl={handle.props.requestUrl}
      title={handle.props.chapter.title}
      description={handle.props.chapter.description}
    >
      <div class="docs-chapter-shell">
        <article class="docs-chapter-article">
          <nav class="docs-breadcrumb">
            <a href={routes.docs.index.href()}>Docs</a>
            <span>/</span>
            <span>{handle.props.chapter.title}</span>
          </nav>

          <header class="docs-page-header docs-chapter-header">
            <p class="docs-eyebrow">{handle.props.chapter.chapter}</p>
            <h1>{handle.props.chapter.title}</h1>
            <p>{handle.props.chapter.description}</p>
          </header>

          <div class="docs-prose" innerHTML={handle.props.chapter.html} />

          <nav aria-label="Chapter navigation" class="docs-pagination">
            {handle.props.previous ? (
              <ChapterPaginationLink
                label="Previous"
                href={routes.docs.chapter.href({
                  slug: handle.props.previous.slug,
                })}
                title={handle.props.previous.title}
              />
            ) : (
              <div />
            )}
            {handle.props.next ? (
              <ChapterPaginationLink
                label="Next"
                href={routes.docs.chapter.href({
                  slug: handle.props.next.slug,
                })}
                title={handle.props.next.title}
                align="right"
              />
            ) : null}
          </nav>
        </article>

        <aside class="docs-toc">
          <h2>On this page</h2>
          <ol>
            {handle.props.chapter.headings.map((heading) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`}>{heading.title}</a>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </DocsDocument>
  );
}

function ChapterPaginationLink(
  handle: Handle<{
    label: "Previous" | "Next";
    href: string;
    title: string;
    align?: "right";
  }>,
) {
  return () => (
    <a
      href={handle.props.href}
      class={
        handle.props.align === "right"
          ? "docs-pagination-link right"
          : "docs-pagination-link"
      }
    >
      <span>{handle.props.label}</span>
      <strong>{handle.props.title}</strong>
    </a>
  );
}
