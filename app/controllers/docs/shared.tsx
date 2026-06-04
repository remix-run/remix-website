import type { Handle, RemixElement, RemixNode } from "remix/ui";

import { routes } from "../../routes.ts";
import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { getSocialHeadTags } from "../../utils/social-head-tags.server.ts";
import { styleHrefs } from "../../utils/style-hrefs.ts";

type DocsDocumentProps = {
  requestUrl: string;
  title: string;
  description: string;
  children: RemixNode;
};

export type DocsPageProps = {
  requestUrl: string;
};

type DocsChapterProps = {
  requestUrl: string;
  chapter: string;
  title: string;
  description: string;
  previous?: {
    href: string;
    title: string;
  };
  next?: {
    href: string;
    title: string;
  };
  children: RemixNode;
};

export let docsResponseInit = {
  headers: {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  },
} satisfies ResponseInit;

export function DocsDocument(handle: Handle<DocsDocumentProps>) {
  return () => {
    let title =
      handle.props.title === "Remix Docs"
        ? "Remix Docs"
        : `${handle.props.title} | Remix Docs`;

    return (
      <Document
        title={title}
        description={handle.props.description}
        stylesheets={[styleHrefs.app]}
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

export function DocsChapter(handle: Handle<DocsChapterProps>) {
  return () => (
    <DocsDocument
      requestUrl={handle.props.requestUrl}
      title={handle.props.title}
      description={handle.props.description}
    >
      <div class="container my-12 grid max-w-full grid-cols-1 gap-10 lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_280px]">
        <article class="max-w-3xl">
          <nav class="rmx-page-body rmx-page-body-sm mb-8">
            <a
              href={routes.docs.index.href()}
              class="text-blue-700 underline dark:text-blue-500"
            >
              Docs
            </a>
            <span class="mx-2 text-gray-400">/</span>
            <span>{handle.props.title}</span>
          </nav>

          <header class="mb-10 flex flex-col gap-5">
            <p class="rmx-page-body rmx-page-body-sm font-semibold uppercase text-red-brand">
              {handle.props.chapter}
            </p>
            <h1 class="rmx-page-title dark:text-gray-200">
              {handle.props.title}
            </h1>
            <p class="rmx-page-body">{handle.props.description}</p>
          </header>

          <div class="flex flex-col gap-10">{handle.props.children}</div>

          <nav
            aria-label="Chapter navigation"
            class="mt-16 grid grid-cols-1 gap-4 border-t border-gray-200 pt-8 sm:grid-cols-2 dark:border-gray-800"
          >
            {handle.props.previous ? (
              <ChapterPaginationLink
                label="Previous"
                href={handle.props.previous.href}
                title={handle.props.previous.title}
                align="left"
              />
            ) : (
              <div />
            )}
            {handle.props.next ? (
              <ChapterPaginationLink
                label="Next"
                href={handle.props.next.href}
                title={handle.props.next.title}
                align="right"
              />
            ) : null}
          </nav>
        </article>

        <aside class="lg:sticky lg:top-8 lg:self-start">
          <h2 class="mb-4 font-mono text-sm uppercase text-gray-500">
            On this page
          </h2>
          <ol class="flex flex-col gap-2">
            {extractHeadingLinks(handle.props.children).map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  class="text-sm text-blue-700 underline dark:text-blue-500"
                >
                  {heading.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </DocsDocument>
  );
}

export function DocsSection(
  handle: Handle<{ id: string; title: string; children: RemixNode }>,
) {
  return () => (
    <section id={handle.props.id}>
      <h2 class="rmx-page-title rmx-page-title-sm mb-4 scroll-mt-8 dark:text-gray-200">
        {handle.props.title}
      </h2>
      <div class="rmx-page-body">{handle.props.children}</div>
    </section>
  );
}

function ChapterPaginationLink(
  handle: Handle<{
    label: "Previous" | "Next";
    href: string;
    title: string;
    align: "left" | "right";
  }>,
) {
  return () => (
    <a
      href={handle.props.href}
      class={`rounded border border-gray-200 p-4 text-blue-700 underline dark:border-gray-800 dark:text-blue-500 ${
        handle.props.align === "right" ? "sm:text-right" : ""
      }`}
    >
      <span class="block font-mono text-xs uppercase text-gray-500">
        {handle.props.label}
      </span>
      <span class="mt-1 block">{handle.props.title}</span>
    </a>
  );
}

function extractHeadingLinks(node: RemixNode) {
  let headings: Array<{ id: string; title: string }> = [];

  function visit(value: RemixNode) {
    if (Array.isArray(value)) {
      for (let child of value) visit(child);
      return;
    }

    if (
      value &&
      typeof value === "object" &&
      "type" in value &&
      value.type === DocsSection
    ) {
      let props = (value as RemixElement).props as {
        id?: unknown;
        title?: unknown;
      };
      if (typeof props.id === "string" && typeof props.title === "string") {
        headings.push({ id: props.id, title: props.title });
      }
    }
  }

  visit(node);
  return headings;
}
