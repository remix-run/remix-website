import type { Handle } from "remix/ui";
import { cx } from "../../utils/public/cx.ts";
import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { BlogLightbox } from "./public/blog-lightbox.tsx";
import { NewsletterSubscribeForm } from "../../ui/public/newsletter-subscribe.tsx";
import type { BlogImageAsset } from "../../utils/blog-image-assets.ts";
import { getSocialHeadTags } from "../../utils/social-head-tags.ts";
import { routes } from "../../routes.ts";
import type { getBlogPost } from "../../data/blog.ts";

interface BlogPostImageAssets {
  authors: Record<string, BlogImageAsset>;
  hero: BlogImageAsset;
}

export const NOT_FOUND_RESPONSE = {
  status: 404,
  statusText: "Not Found",
  headers: {
    "Cache-Control": "no-store",
  },
};

export function BlogPostPage(
  handle: Handle<{
    requestUrl: string;
    slug: string;
    post: Awaited<ReturnType<typeof getBlogPost>>;
    images: BlogPostImageAssets;
    socialImageUrl: string;
  }>,
) {
  return () => (
    <Document
      title={`${handle.props.post.title} | Remix`}
      description={handle.props.post.summary}
      stylesheets={["app", "md"]}
      headTags={[
        {
          kind: "link",
          rel: "alternate",
          href: routes.blog.post.href({ slug: handle.props.slug, ext: "md" }),
          type: "text/markdown",
        },
        ...getSocialHeadTags({
          requestUrl: handle.props.requestUrl,
          title: handle.props.post.title,
          description: handle.props.post.summary,
          image: handle.props.socialImageUrl,
          imageAlt: handle.props.post.imageAlt,
          twitterCreator: "@remix_run",
          twitterSite: "@remix_run",
        }),
      ]}
    >
      <Header />
      <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
        <BlogPostContent
          post={handle.props.post}
          images={handle.props.images}
        />
      </main>
      <Footer />
      <BlogLightbox />
    </Document>
  );
}

function BlogPostContent(
  handle: Handle<{
    post: Awaited<ReturnType<typeof getBlogPost>>;
    images: BlogPostImageAssets;
  }>,
) {
  return () => (
    <>
      {handle.props.post.draft ? (
        <div class="m-auto mb-8 max-w-3xl rounded-sm bg-red-700 px-5 py-3 text-center text-gray-100 dark:bg-red-400 dark:text-gray-700">
          🚨 This is a draft, please do not share this page until it&apos;s
          officially published 🚨
        </div>
      ) : null}
      <div class="flex flex-1 flex-col">
        <div class="flex-1">
          <div>
            <div class="relative h-[280px] bg-gray-900 md:mx-auto md:h-[400px] md:max-w-3xl md:rounded-xl xl:h-[480px]">
              <div class="absolute inset-0">
                <img
                  class={cx(
                    "h-full w-full object-cover object-top md:rounded-xl",
                    !handle.props.post.imageDisableOverlay && "opacity-40",
                  )}
                  src={handle.props.images.hero.src}
                  srcSet={handle.props.images.hero.srcSet}
                  sizes="(min-width: 768px) 768px, 100vw"
                  width={handle.props.images.hero.width}
                  height={handle.props.images.hero.height}
                  alt={handle.props.post.imageAlt}
                  loading="eager"
                  fetchpriority="high"
                />
              </div>
              <div class="container relative z-10 flex h-full w-full max-w-full flex-col pt-6 md:pt-10 lg:max-w-4xl">
                <div class="flex-1">
                  <div class="flex flex-col gap-3">
                    <div class="rmx-page-meta text-white">
                      {handle.props.post.dateDisplay}
                    </div>
                    <h1
                      class={cx(
                        "rmx-page-title text-white",
                        handle.props.post.title.length > 50 &&
                          "rmx-page-title-sm",
                      )}
                    >
                      {handle.props.post.title}
                    </h1>
                  </div>
                  <div class="h-2" />
                </div>
                <div class="flex flex-col gap-1 pb-4 md:pb-10">
                  {handle.props.post.authors.map((author) => {
                    let image = handle.props.images.authors[author.avatar];
                    return (
                      <div key={author.name} class="flex items-center">
                        <div>
                          <img
                            class="h-10 w-10 rounded-full md:h-14 md:w-14"
                            src={image?.src ?? author.avatar}
                            srcSet={image?.srcSet}
                            sizes="(min-width: 768px) 56px, 40px"
                            width={image?.width}
                            height={image?.height}
                            alt=""
                            decoding="async"
                          />
                        </div>
                        <div class="w-6" />
                        <div class="flex flex-col gap-2">
                          <div class="rmx-page-title rmx-page-title-xs text-white">
                            {author.name}
                          </div>
                          <div class="rmx-page-body text-white">
                            {author.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div class="h-6 sm:h-12" />
            <div class="container max-w-full lg:max-w-3xl">
              <div class="md-prose" innerHTML={handle.props.post.html} />
              <hr />
            </div>
          </div>
        </div>
      </div>

      <div class="container m-auto mb-12 mt-24 max-w-lg">
        <h3 class="rmx-page-title rmx-page-title-sm mb-6">
          Get updates on the latest Remix news
        </h3>
        <div class="rmx-page-body mb-6" id="newsletter-text">
          Be the first to learn about new Remix features, community events, and
          tutorials.
        </div>
        <NewsletterSubscribeForm
          class="sm:flex sm:gap-2"
          inputClass="w-full sm:w-auto sm:flex-1 box-border appearance-none rounded border px-4 py-2 dark:placeholder-gray-500"
          buttonClass="mt-2 w-full rounded border bg-white px-4 py-2 font-semibold uppercase text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white sm:mt-0 sm:w-auto"
        />
      </div>
    </>
  );
}
