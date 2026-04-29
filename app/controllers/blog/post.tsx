import cx from "clsx";
import { Document } from "../../ui/document";
import { Footer } from "../../ui/footer";
import { Header } from "../../ui/header";
import { NewsletterSubscribeForm } from "../../assets/newsletter-subscribe";
import { routes } from "../../routes";
import { renderNotFoundPage } from "../../ui/not-found-page";
import { render } from "../../utils/render";
import { getBlogPost, getRawBlogPostMarkdown } from "../../data/blog.server";
import { CACHE_CONTROL } from "../../utils/cache-control";
import { styleHrefs } from "../../utils/style-hrefs";

type BlogPostContext = {
  params: { slug?: string; ext?: string };
  request: Request;
};

export async function blogPostHandler(context: BlogPostContext) {
  let slug = context.params.slug;
  if (!slug) {
    return renderNotFoundPage();
  }

  let requestUrl = new URL(context.request.url);
  let isMarkdownRequest = context.params.ext === "md";
  if (isMarkdownRequest) {
    try {
      let markdown = getRawBlogPostMarkdown(slug);
      return new Response(markdown, {
        headers: {
          "Cache-Control": CACHE_CONTROL.DEFAULT,
          "Content-Type": "text/markdown; charset=utf-8",
        },
      });
    } catch (error) {
      if (error instanceof Response && error.status === 404) {
        return error;
      }
      throw error;
    }
  }

  let post;
  try {
    post = await getBlogPost(slug);
  } catch (error) {
    if (error instanceof Response && error.status === 404) {
      return renderNotFoundPage();
    }
    throw error;
  }

  let siteUrl = requestUrl.origin;
  let ogImageUrl = new URL(routes.blogOgImage.href({ slug }), siteUrl);
  ogImageUrl.searchParams.set("title", post.title);
  ogImageUrl.searchParams.set("date", post.dateDisplay);
  for (let author of post.authors) {
    ogImageUrl.searchParams.append("authorName", author.name);
    ogImageUrl.searchParams.append("authorTitle", author.title);
  }
  if (post.ogImage) {
    ogImageUrl.searchParams.set("ogImage", post.ogImage);
  }

  let pageUrl = routes.blogPost.href({ slug });

  return render.document(
    <Page
      slug={slug}
      post={post}
      pageUrl={`${siteUrl}${pageUrl}`}
      socialImageUrl={ogImageUrl.toString()}
    />,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}

function Page() {
  return (props: {
    slug: string;
    post: Awaited<ReturnType<typeof getBlogPost>>;
    pageUrl: string;
    socialImageUrl: string;
  }) => (
    <Document
      title={`${props.post.title} | Remix`}
      description={props.post.summary}
      headTags={[
        { kind: "link", rel: "stylesheet", href: styleHrefs.md },
        {
          kind: "link",
          rel: "alternate",
          href: routes.blogPost.href({ slug: props.slug, ext: "md" }),
          type: "text/markdown",
        },
        { kind: "meta", property: "og:type", content: "website" },
        { kind: "meta", property: "og:title", content: props.post.title },
        {
          kind: "meta",
          property: "og:description",
          content: props.post.summary,
        },
        { kind: "meta", property: "og:url", content: props.pageUrl },
        {
          kind: "meta",
          property: "og:image",
          content: props.socialImageUrl,
        },
        {
          kind: "meta",
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          kind: "meta",
          name: "twitter:creator",
          content: "@remix_run",
        },
        { kind: "meta", name: "twitter:site", content: "@remix_run" },
        { kind: "meta", name: "twitter:title", content: props.post.title },
        {
          kind: "meta",
          name: "twitter:description",
          content: props.post.summary,
        },
        {
          kind: "meta",
          name: "twitter:image",
          content: props.socialImageUrl,
        },
        {
          kind: "meta",
          name: "twitter:image:alt",
          content: props.post.imageAlt,
        },
      ]}
    >
      <Header />
      <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
        <BlogPostContent post={props.post} />
      </main>
      <Footer />
    </Document>
  );
}

function BlogPostContent() {
  return (props: { post: Awaited<ReturnType<typeof getBlogPost>> }) => (
    <>
      {props.post.draft ? (
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
                    !props.post.imageDisableOverlay && "opacity-40",
                  )}
                  src={props.post.image}
                  alt={props.post.imageAlt}
                />
              </div>
              <div class="container relative z-10 flex h-full w-full max-w-full flex-col pt-6 md:pt-10 lg:max-w-4xl">
                <div class="flex-1">
                  <div class="rmx-page-body rmx-page-body-sm uppercase text-white">
                    {props.post.dateDisplay}
                  </div>
                  <div class="h-2" />
                  <h1
                    class={cx(
                      "rmx-page-title text-white",
                      props.post.title.length > 50 && "rmx-page-title-sm",
                    )}
                  >
                    {props.post.title}
                  </h1>
                  <div class="h-2" />
                </div>
                <div class="flex flex-col gap-1 pb-4 md:pb-10">
                  {props.post.authors.map((author) => (
                    <div key={author.name} class="flex items-center">
                      <div>
                        <img
                          class="h-10 w-10 rounded-full md:h-14 md:w-14"
                          src={author.avatar}
                          alt=""
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
                  ))}
                </div>
              </div>
            </div>
            <div class="h-6 sm:h-12" />
            <div class="container max-w-full lg:max-w-3xl">
              <div class="md-prose" innerHTML={props.post.html} />
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
