import { createController } from "remix/router";
import type { Handle } from "remix/ui";

import { getDocsChapters } from "../../data/docs.server.ts";
import type { DocsChapter } from "../../data/docs.server.ts";
import type { AppContext } from "../../middleware/render.ts";
import { routes } from "../../routes.ts";
import { StatusErrorDocument } from "../../ui/not-found-page.tsx";
import { DocsChapterPage, DocsDocument, docsResponseInit } from "./shared.tsx";

export let docsController = createController(routes.docs, {
  actions: {
    async index({ render, request }) {
      let chapters = await getDocsChapters();
      return render(
        <DocsIndexPage requestUrl={request.url} chapters={chapters} />,
        docsResponseInit,
      );
    },

    async chapter({ params, render, request }: DocsChapterContext) {
      let slug = params.slug;
      let chapters = await getDocsChapters();
      let chapterIndex = slug
        ? chapters.findIndex((chapter) => chapter.slug === slug)
        : -1;
      let chapter = chapterIndex >= 0 ? chapters[chapterIndex] : undefined;

      if (!chapter) {
        return render(
          <StatusErrorDocument status={404} statusText="Not Found" />,
          {
            status: 404,
            statusText: "Not Found",
            headers: { "Cache-Control": "no-store" },
          },
        );
      }

      return render(
        <DocsChapterPage
          requestUrl={request.url}
          chapter={chapter}
          previous={chapters[chapterIndex - 1]}
          next={chapters[chapterIndex + 1]}
        />,
        docsResponseInit,
      );
    },
  },
});

type DocsChapterContext = AppContext & {
  params: { slug?: string };
};

function DocsIndexPage(
  handle: Handle<{ requestUrl: string; chapters: Array<DocsChapter> }>,
) {
  return () => (
    <DocsDocument
      requestUrl={handle.props.requestUrl}
      title="Remix Docs"
      description="Guides, explanations, examples, and tutorials for learning Remix."
    >
      <div class="docs-index-shell">
        <header class="docs-page-header docs-index-header">
          <p class="docs-eyebrow">Remix Docs</p>
          <h1>Learn Remix from the request up.</h1>
          <div class="docs-index-intro">
            <p>
              These guide chapters introduce Remix at a high level, then
              progressively deepen into routing, rendering, interactivity, data,
              security, assets, testing, production, examples, and tutorials.
            </p>
            <p>
              API reference lives separately at{" "}
              <a href="https://api.remix.run">api.remix.run</a>.
            </p>
          </div>
        </header>

        <ol class="docs-chapter-grid">
          {handle.props.chapters.map((chapter) => (
            <ChapterCard key={chapter.slug} chapter={chapter} />
          ))}
        </ol>
      </div>
    </DocsDocument>
  );
}

function ChapterCard(handle: Handle<{ chapter: DocsChapter }>) {
  return () => (
    <li>
      <article class="docs-chapter-card">
        <p>{handle.props.chapter.chapter}</p>
        <h2>
          <a
            href={routes.docs.chapter.href({ slug: handle.props.chapter.slug })}
          >
            {handle.props.chapter.title}
          </a>
        </h2>
        <p>{handle.props.chapter.description}</p>
        <ol>
          {handle.props.chapter.headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`${routes.docs.chapter.href({ slug: handle.props.chapter.slug })}#${heading.id}`}
              >
                {heading.title}
              </a>
            </li>
          ))}
        </ol>
      </article>
    </li>
  );
}
