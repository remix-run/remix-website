import { createController } from "remix/router";
import type { Handle } from "remix/ui";

import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { NewsletterSubscribeForm } from "../../ui/public/newsletter-subscribe.tsx";
import { routes } from "../../routes.ts";
import { getBlogPostListings } from "../../data/blog.ts";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { getSocialHeadTags } from "../../utils/social-head-tags.ts";
import { styleHrefs } from "../../utils/public/style-hrefs.ts";
import { getBlogPost, getRawBlogPostMarkdown } from "../../data/blog.ts";
import { StatusErrorDocument } from "../../ui/not-found-page.tsx";
import { BlogPostPage, NOT_FOUND_RESPONSE } from "./post-page.tsx";
import { buildBlogRssResponse, getBlogRssPosts } from "./rss.ts";

export default createController(routes.blog, {
  actions: {
    async index({ render, request }) {
      return render(
        <Page posts={getBlogPostListings()} requestUrl={request.url} />,
        {
          headers: { "Cache-Control": CACHE_CONTROL.DEFAULT },
        },
      );
    },

    async post({ params, render, request }) {
      let slug = params.slug;
      if (!slug) {
        return render(
          <StatusErrorDocument status={404} statusText="Not Found" />,
          NOT_FOUND_RESPONSE,
        );
      }

      if (params.ext === "md") {
        try {
          return new Response(getRawBlogPostMarkdown(slug), {
            headers: {
              "Cache-Control": CACHE_CONTROL.DEFAULT,
              "Content-Type": "text/markdown; charset=utf-8",
            },
          });
        } catch (error) {
          if (error instanceof Response && error.status === 404) return error;
          throw error;
        }
      }

      let post;
      try {
        post = await getBlogPost(slug);
      } catch (error) {
        if (error instanceof Response && error.status === 404) {
          return render(
            <StatusErrorDocument status={404} statusText="Not Found" />,
            NOT_FOUND_RESPONSE,
          );
        }
        throw error;
      }

      return render(
        <BlogPostPage
          requestUrl={request.url}
          slug={slug}
          post={post}
          socialImageUrl={getPostSocialImageUrl(post, slug, request.url)}
        />,
        { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } },
      );
    },

    async rss() {
      return buildBlogRssResponse(await getBlogRssPosts());
    },
  },
});

function Page(
  handle: Handle<{
    posts: ReturnType<typeof getBlogPostListings>;
    requestUrl: string;
  }>,
) {
  return () => (
    <Document
      title="Remix Blog"
      description="Thoughts about building excellent user experiences with Remix."
      stylesheets={[styleHrefs.app]}
      headTags={getSocialHeadTags({
        requestUrl: handle.props.requestUrl,
        title: "Remix Blog",
        description:
          "Thoughts about building excellent user experiences with Remix.",
      })}
    >
      <Header />
      <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
        <BlogPageContent posts={handle.props.posts} />
      </main>
      <Footer />
    </Document>
  );
}

function BlogPageContent(
  handle: Handle<{
    posts: ReturnType<typeof getBlogPostListings>;
  }>,
) {
  return () => {
    let [latestPost, ...posts] = handle.props.posts;
    let featuredPosts = handle.props.posts.filter((post) => post.featured);

    return (
      <div class="rmx-page-body mt-8 flex flex-1 flex-col px-12">
        <div class="mx-auto w-full max-w-[1400px]">
          <div class="md:grid md:grid-cols-12">
            <div class="md:col-span-7">
              {latestPost ? (
                <div class="mb-14">
                  <a href={routes.blog.post.href({ slug: latestPost.slug })}>
                    <div class="mb-6 aspect-[16/9]">
                      <img
                        class="mb-6 h-full w-full object-cover object-top shadow md:rounded-md"
                        src={latestPost.image}
                        alt={latestPost.imageAlt}
                      />
                    </div>
                    <div class="flex flex-col gap-4">
                      <p class="rmx-page-meta">{latestPost.dateDisplay}</p>
                      <p class="rmx-page-title">{latestPost.title}</p>
                      <p class="rmx-page-body">{latestPost.summary}</p>
                    </div>
                  </a>
                </div>
              ) : null}

              <div class="mt-12 lg:grid lg:grid-cols-2 lg:gap-6">
                {posts.map((post) => (
                  <div key={post.slug}>
                    <a href={routes.blog.post.href({ slug: post.slug })}>
                      <div class="mb-6 aspect-[16/9]">
                        <img
                          class="h-full w-full object-cover object-top shadow md:rounded-md"
                          src={post.image}
                          alt={post.imageAlt}
                        />
                      </div>
                      <div class="mb-12 flex flex-col gap-4">
                        <p class="rmx-page-meta">{post.dateDisplay}</p>
                        <p class="rmx-page-title rmx-page-title-xs">
                          {post.title}
                        </p>
                        <p class="rmx-page-body">{post.summary}</p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div class="h-24 md:hidden" />
            <div class="md:col-span-4 md:col-start-9">
              {featuredPosts.length ? (
                <>
                  <h3 class="rmx-page-title rmx-page-title-sm mb-8">
                    Featured Articles
                  </h3>
                  <div class="grid grid-cols-1 gap-4">
                    {featuredPosts.map((post, index, array) => (
                      <div key={post.slug}>
                        <div class="flex flex-col">
                          <div class="flex flex-col">
                            <a
                              href={routes.blog.post.href({ slug: post.slug })}
                              class="rmx-page-body"
                            >
                              {post.title}
                            </a>
                          </div>
                        </div>
                        {index !== array.length - 1 ? (
                          <hr class="my-4" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div class="h-24" />
                </>
              ) : null}

              <div>
                <h3 class="rmx-page-title rmx-page-title-sm mb-6">
                  Get updates on the latest Remix news
                </h3>
                <div class="rmx-page-body mb-6" id="newsletter-text">
                  Be the first to learn about new Remix features, community
                  events, and tutorials.
                </div>
                <NewsletterSubscribeForm
                  class="sm:flex sm:gap-2"
                  inputClass="w-full sm:w-auto sm:flex-1 box-border appearance-none rounded border px-4 py-2 dark:placeholder-gray-500"
                  buttonClass="mt-2 w-full rounded border bg-white px-4 py-2 font-semibold uppercase text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white sm:mt-0 sm:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}

function getPostSocialImageUrl(
  post: Awaited<ReturnType<typeof getBlogPost>>,
  slug: string,
  requestUrl: string,
) {
  let ogImageUrl = new URL(
    routes.blogOgImage.href({ slug }),
    new URL(requestUrl).origin,
  );
  ogImageUrl.searchParams.set("title", post.title);
  ogImageUrl.searchParams.set("date", post.dateDisplay);
  for (let author of post.authors) {
    ogImageUrl.searchParams.append("authorName", author.name);
    ogImageUrl.searchParams.append("authorTitle", author.title);
  }
  if (post.ogImage) {
    ogImageUrl.searchParams.set("ogImage", post.ogImage);
  }

  return ogImageUrl.toString();
}
