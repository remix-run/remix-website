import { createController } from "remix/router";
import { css, type Handle } from "remix/ui";

import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { NewsletterSubscribe } from "../../ui/newsletter-subscribe.tsx";
import {
  pageBodyStyle,
  pageMetaStyle,
  pageTitleExtraSmallStyle,
  pageTitleSmallStyle,
  pageTitleStyle,
} from "../../ui/public/marketing-styles.ts";
import { breakpointMedia } from "../../ui/public/theme.ts";
import { routes } from "../../routes.ts";
import { getBlogPostListings } from "../../data/blog.ts";
import {
  getAuthorImageAsset,
  getBlogImageAsset,
} from "../../utils/blog-image-assets.ts";
import { CACHE } from "../../utils/cache-control.ts";
import { getSocialHeadTags } from "../../utils/social-head-tags.ts";
import { getBlogPost, getRawBlogPostMarkdown } from "../../data/blog.ts";
import { StatusErrorDocument } from "../../ui/not-found-page.tsx";
import { BlogPostPage, NOT_FOUND_RESPONSE } from "./post-page.tsx";
import { buildBlogRssResponse, getBlogRssPosts } from "./rss.ts";

export default createController(routes.blog, {
  actions: {
    async index({ render, request }) {
      let posts = await loadBlogPostListings();

      return render(<Page posts={posts} requestUrl={request.url} />);
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
              "Cache-Control": CACHE.RESOURCE,
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

      let images = await loadBlogPostImages(post);

      return render(
        <BlogPostPage
          requestUrl={request.url}
          slug={slug}
          post={post}
          images={images}
          socialImageUrl={getPostSocialImageUrl(post, slug, request.url)}
        />,
      );
    },

    async rss() {
      return buildBlogRssResponse(await getBlogRssPosts());
    },
  },
});

function Page(
  handle: Handle<{
    posts: Awaited<ReturnType<typeof loadBlogPostListings>>;
    requestUrl: string;
  }>,
) {
  return () => {
    let headTags = getSocialHeadTags({
      requestUrl: handle.props.requestUrl,
      title: "Remix Blog",
      description:
        "Thoughts about building excellent user experiences with Remix.",
    });
    let latestPost = handle.props.posts[0];
    if (latestPost) {
      headTags.unshift({
        kind: "link",
        rel: "preload",
        as: "image",
        href: latestPost.imageAsset.src,
        imageSrcSet: latestPost.imageAsset.srcSet,
        imageSizes: blogHeroImageSizes,
        fetchpriority: "high",
      });
    }

    return (
      <Document
        title="Remix Blog"
        description="Thoughts about building excellent user experiences with Remix."
        headTags={headTags}
      >
        <Header currentSection="blog" />
        <main
          mix={css({
            display: "flex",
            flex: 1,
            flexDirection: "column",
          })}
        >
          <BlogPageContent posts={handle.props.posts} />
        </main>
        <Footer />
      </Document>
    );
  };
}

function BlogPageContent(
  handle: Handle<{
    posts: Awaited<ReturnType<typeof loadBlogPostListings>>;
  }>,
) {
  return () => {
    let [latestPost, ...posts] = handle.props.posts;
    let featuredPosts = handle.props.posts.filter((post) => post.featured);

    return (
      <div
        mix={[
          pageBodyStyle,
          css({
            ...blogContainerStyle,
            display: "flex",
            maxWidth: "100%",
            flex: 1,
            flexDirection: "column",
            marginBlockStart: "32px",
          }),
        ]}
      >
        <div
          mix={css({
            width: "100%",
            maxWidth: "1400px",
            marginInline: "auto",
          })}
        >
          <div
            mix={css({
              [breakpointMedia.md]: {
                display: "grid",
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
              },
            })}
          >
            <div
              mix={css({
                [breakpointMedia.md]: { gridColumn: "span 7 / span 7" },
              })}
            >
              {latestPost ? (
                <div mix={css({ marginBlockEnd: "56px" })}>
                  <a href={routes.blog.post.href({ slug: latestPost.slug })}>
                    <div mix={blogImageFrameStyle}>
                      <img
                        mix={blogCardImageStyle}
                        src={latestPost.imageAsset.src}
                        srcSet={latestPost.imageAsset.srcSet}
                        sizes={blogHeroImageSizes}
                        width={latestPost.imageAsset.width}
                        height={latestPost.imageAsset.height}
                        alt={latestPost.imageAlt}
                        loading="eager"
                        fetchpriority="high"
                      />
                    </div>
                    <div mix={blogCardCopyStyle}>
                      <p mix={pageMetaStyle}>{latestPost.dateDisplay}</p>
                      <p mix={pageTitleStyle}>{latestPost.title}</p>
                      <p mix={pageBodyStyle}>{latestPost.summary}</p>
                    </div>
                  </a>
                </div>
              ) : null}

              <div
                mix={css({
                  marginBlockStart: "48px",
                  [breakpointMedia.lg]: {
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "24px",
                  },
                })}
              >
                {posts.map((post) => (
                  <div key={post.slug}>
                    <a href={routes.blog.post.href({ slug: post.slug })}>
                      <div mix={blogImageFrameStyle}>
                        <img
                          mix={blogCardImageStyle}
                          src={post.imageAsset.src}
                          srcSet={post.imageAsset.srcSet}
                          sizes="(min-width: 1496px) 397px, (min-width: 1024px) calc(29.167vw - 40px), (min-width: 768px) calc(58.333vw - 56px), calc(100vw - 96px)"
                          width={post.imageAsset.width}
                          height={post.imageAsset.height}
                          alt={post.imageAlt}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div
                        mix={[
                          blogCardCopyStyle,
                          css({ marginBlockEnd: "48px" }),
                        ]}
                      >
                        <p mix={pageMetaStyle}>{post.dateDisplay}</p>
                        <p mix={[pageTitleStyle, pageTitleExtraSmallStyle]}>
                          {post.title}
                        </p>
                        <p mix={pageBodyStyle}>{post.summary}</p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div
              mix={css({
                height: "96px",
                [breakpointMedia.md]: { display: "none" },
              })}
            />
            <div
              mix={css({
                minWidth: 0,
                [breakpointMedia.md]: { gridColumn: "9 / span 4" },
              })}
            >
              {featuredPosts.length ? (
                <>
                  <h3
                    mix={[
                      pageTitleStyle,
                      pageTitleSmallStyle,
                      css({ marginBlockEnd: "32px" }),
                    ]}
                  >
                    Featured Articles
                  </h3>
                  <div
                    mix={css({
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr)",
                      gap: "16px",
                    })}
                  >
                    {featuredPosts.map((post, index, array) => (
                      <div key={post.slug}>
                        <a
                          href={routes.blog.post.href({ slug: post.slug })}
                          mix={pageBodyStyle}
                        >
                          {post.title}
                        </a>
                        {index !== array.length - 1 ? (
                          <hr mix={css({ marginBlock: "16px" })} />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div mix={css({ height: "96px" })} />
                </>
              ) : null}

              <div>
                <h3
                  mix={[
                    pageTitleStyle,
                    pageTitleSmallStyle,
                    css({ marginBlockEnd: "24px" }),
                  ]}
                >
                  Get updates on the latest Remix news
                </h3>
                <div mix={[pageBodyStyle, css({ marginBlockEnd: "24px" })]}>
                  Be the first to learn about new Remix features, community
                  events, and tutorials.
                </div>
                <NewsletterSubscribe />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}

async function loadBlogPostListings() {
  return Promise.all(
    getBlogPostListings().map(async (post) => ({
      ...post,
      imageAsset: await getBlogImageAsset(post.image),
    })),
  );
}

async function loadBlogPostImages(
  post: Awaited<ReturnType<typeof getBlogPost>>,
) {
  let [hero, authorEntries] = await Promise.all([
    getBlogImageAsset(post.image),
    Promise.all(
      post.authors.map(
        async (author) =>
          [author.avatar, await getAuthorImageAsset(author.avatar)] as const,
      ),
    ),
  ]);

  return {
    authors: Object.fromEntries(authorEntries),
    hero,
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

let blogHeroImageSizes =
  "(min-width: 1496px) 817px, (min-width: 768px) calc(58.333vw - 56px), calc(100vw - 96px)";

let blogContainerStyle = {
  boxSizing: "border-box",
  width: "100%",
  marginInline: "auto",
  paddingInline: "24px",
  [breakpointMedia.md]: { paddingInline: "32px" },
  [breakpointMedia.lg]: { paddingInline: "40px" },
} as const;

let blogImageFrameStyle = css({
  aspectRatio: "16 / 9",
  marginBlockEnd: "24px",
});

let blogCardImageStyle = css({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "top",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  [breakpointMedia.md]: { borderRadius: "6px" },
});

let blogCardCopyStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});
