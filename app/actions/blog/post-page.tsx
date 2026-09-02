import { css, type Handle } from "remix/ui";
import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { ImageLightbox } from "../../ui/public/image-lightbox.tsx";
import {
  pageBodyStyle,
  pageMetaStyle,
  pageTitleExtraSmallStyle,
  pageTitleSmallStyle,
  pageTitleStyle,
} from "../../ui/public/marketing-styles.ts";
import { breakpointMedia, theme } from "../../ui/public/theme.ts";
import { NewsletterSignupCta } from "../../ui/newsletter-signup.tsx";
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
      stylesheets={["md"]}
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
      <Header currentSection="blog" />
      <main
        id="main-content"
        mix={css({
          display: "flex",
          flex: 1,
          flexDirection: "column",
        })}
        tabIndex={-1}
      >
        <BlogPostContent
          post={handle.props.post}
          images={handle.props.images}
        />
      </main>
      <Footer />
      <ImageLightbox />
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
        <div
          mix={css({
            maxWidth: "768px",
            marginInline: "auto",
            marginBlockEnd: "32px",
            borderRadius: "2px",
            backgroundColor: "light-dark(#bd1825, #fc6d78)",
            padding: "12px 20px",
            color: "light-dark(#e3e3e3, #434343)",
            textAlign: "center",
          })}
        >
          🚨 This is a draft, please do not share this page until it&apos;s
          officially published 🚨
        </div>
      ) : null}
      <div
        mix={css({
          display: "flex",
          flex: 1,
          flexDirection: "column",
        })}
      >
        <div mix={css({ flex: 1 })}>
          <div>
            <div
              mix={css({
                position: "relative",
                height: "280px",
                backgroundColor: "#121212",
                [breakpointMedia.md]: {
                  height: "400px",
                  maxWidth: "768px",
                  marginInline: "auto",
                  borderRadius: "12px",
                },
                [breakpointMedia.xl]: { height: "480px" },
              })}
            >
              <div
                mix={css({
                  position: "absolute",
                  inset: 0,
                })}
              >
                <img
                  mix={
                    handle.props.post.imageDisableOverlay
                      ? blogPostHeroImageStyle
                      : [blogPostHeroImageStyle, css({ opacity: 0.4 })]
                  }
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
              <div
                mix={css({
                  ...blogPostContainerStyle,
                  position: "relative",
                  zIndex: 10,
                  display: "flex",
                  height: "100%",
                  maxWidth: "100%",
                  flexDirection: "column",
                  paddingBlockStart: "24px",
                  [breakpointMedia.md]: {
                    paddingInline: "32px",
                    paddingBlockStart: "40px",
                  },
                  [breakpointMedia.lg]: {
                    maxWidth: "896px",
                    paddingInline: "40px",
                  },
                })}
              >
                <div mix={css({ flex: 1 })}>
                  <div
                    mix={css({
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    })}
                  >
                    <div mix={[pageMetaStyle, blogPostOnImageStyle]}>
                      {handle.props.post.dateDisplay}
                    </div>
                    <h1
                      mix={
                        handle.props.post.title.length > 50
                          ? [
                              pageTitleStyle,
                              pageTitleSmallStyle,
                              blogPostOnImageStyle,
                            ]
                          : [pageTitleStyle, blogPostOnImageStyle]
                      }
                    >
                      {handle.props.post.title}
                    </h1>
                  </div>
                  <div mix={css({ height: "8px" })} />
                </div>
                <div
                  mix={css({
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    paddingBlockEnd: "16px",
                    [breakpointMedia.md]: { paddingBlockEnd: "40px" },
                  })}
                >
                  {handle.props.post.authors.map((author) => {
                    let image = handle.props.images.authors[author.avatar];
                    return (
                      <div
                        key={author.name}
                        mix={css({
                          display: "flex",
                          alignItems: "center",
                          gap: "24px",
                        })}
                      >
                        <img
                          mix={css({
                            width: "40px",
                            height: "40px",
                            borderRadius: theme.radius.full,
                            [breakpointMedia.md]: {
                              width: "56px",
                              height: "56px",
                            },
                          })}
                          src={image?.src ?? author.avatar}
                          srcSet={image?.srcSet}
                          sizes="(min-width: 768px) 56px, 40px"
                          width={image?.width}
                          height={image?.height}
                          alt=""
                          decoding="async"
                        />
                        <div
                          mix={css({
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          })}
                        >
                          <div
                            mix={[
                              pageTitleStyle,
                              pageTitleExtraSmallStyle,
                              blogPostOnImageStyle,
                            ]}
                          >
                            {author.name}
                          </div>
                          <div mix={[pageBodyStyle, blogPostOnImageStyle]}>
                            {author.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div
              mix={css({
                height: "24px",
                [breakpointMedia.sm]: { height: "48px" },
              })}
            />
            <div
              mix={css({
                ...blogPostContainerStyle,
                maxWidth: "100%",
                [breakpointMedia.lg]: {
                  maxWidth: "768px",
                  paddingInline: "40px",
                },
              })}
            >
              <div class="md-prose" innerHTML={handle.props.post.html} />
              <hr />
            </div>
          </div>
        </div>
      </div>

      <div
        mix={css({
          ...blogPostContainerStyle,
          maxWidth: "100%",
          marginBlock: "96px 48px",
        })}
      >
        <NewsletterSignupCta />
      </div>
    </>
  );
}

let blogPostContainerStyle = {
  boxSizing: "border-box",
  width: "100%",
  marginInline: "auto",
  paddingInline: "24px",
  [breakpointMedia.md]: { paddingInline: "32px" },
  [breakpointMedia.lg]: { paddingInline: "40px" },
} as const;

let blogPostHeroImageStyle = css({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "top",
  [breakpointMedia.md]: { borderRadius: "12px" },
});

let blogPostOnImageStyle = css({ color: "#ffffff" });
