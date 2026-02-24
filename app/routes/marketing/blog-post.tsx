import { getBlogPost } from "~/lib/blog.server";
import mdStyles from "../../../shared/md.css?url";
import { useRef } from "react";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-links";

import { Subscribe } from "~/ui/subscribe";
import { clsx } from "clsx";
import type { Route } from "./+types/blog-post";
import { href } from "react-router";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  let post = await getBlogPost(params.slug);

  return { siteUrl, post };
};

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: mdStyles },
];

export function meta({ loaderData, params }: Route.MetaArgs) {
  let { slug } = params;

  let { siteUrl, post } = loaderData || {};
  if (!post) {
    return [{ title: "404 Not Found | Remix" }];
  }

  let ogImageUrl = siteUrl
    ? new URL(href("/img/:slug", { slug }), siteUrl)
    : null;

  if (ogImageUrl) {
    ogImageUrl.searchParams.set("title", post.title);
    ogImageUrl.searchParams.set("date", post.dateDisplay);
    for (let { name, title } of post.authors) {
      ogImageUrl.searchParams.append("authorName", name);
      ogImageUrl.searchParams.append("authorTitle", title);
    }
    if (post.ogImage) {
      ogImageUrl.searchParams.set("ogImage", post.ogImage);
    }
  }

  let socialImageUrl = ogImageUrl?.toString();
  let url = siteUrl ? `${siteUrl}/blog/${slug}` : null;

  return [
    { title: post.title + " | Remix" },
    { name: "description", content: post.summary },
    { property: "og:url", content: url },
    { property: "og:title", content: post.title },
    { property: "og:image", content: socialImageUrl },
    { property: "og:description", content: post.summary },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:creator", content: "@remix_run" },
    { name: "twitter:site", content: "@remix_run" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: post.summary },
    { name: "twitter:image", content: socialImageUrl },
    {
      name: "twitter:image:alt",
      content: socialImageUrl ? post.imageAlt : undefined,
    },
  ];
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  let { post } = loaderData;
  let mdRef = useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(mdRef);

  return (
    <>
      {post.draft ? (
        <div className="m-auto mb-8 max-w-3xl rounded-sm bg-red-700 px-5 py-3 text-center text-gray-100 dark:bg-red-400 dark:text-gray-700">
          🚨 This is a draft, please do not share this page until it's
          officially published 🚨
        </div>
      ) : null}
      <div className="flex flex-1 flex-col">
        <div className="flex-1">
          <div>
            <div className="relative h-[280px] bg-gray-900 md:mx-auto md:h-[400px] md:max-w-3xl md:rounded-xl xl:h-[480px]">
              <div className="absolute inset-0">
                <img
                  className={clsx(
                    "h-full w-full object-cover object-top md:rounded-xl",
                    !post.imageDisableOverlay && "opacity-40",
                  )}
                  src={post.image}
                  alt={post.imageAlt}
                />
              </div>
              <div className="container relative z-10 flex h-full w-full max-w-full flex-col pt-6 md:pt-10 lg:max-w-4xl">
                <div className="flex-1">
                  <div className="text-sm uppercase text-white md:text-base">
                    {post.dateDisplay}
                  </div>
                  <div className="h-2" />
                  <h1
                    className={clsx(
                      "font-display font-extrabold text-white md:text-4xl",
                      post.title.length > 50 ? "text-2xl" : "text-3xl",
                    )}
                  >
                    {post.title}
                  </h1>
                  <div className="h-2" />
                </div>
                <div className="flex flex-col gap-1 pb-4 md:pb-10">
                  {post.authors.map((author) => (
                    <div key={author.name} className="flex items-center">
                      <div>
                        <img
                          className="h-10 w-10 rounded-full md:h-14 md:w-14"
                          src={author.avatar}
                          alt=""
                        />
                      </div>
                      <div className="w-6" />
                      <div>
                        <div className="font-display text-lg font-extrabold leading-none text-white md:text-3xl">
                          {author.name}
                        </div>
                        <div className="text-base leading-tight text-white md:text-base">
                          {author.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-6 sm:h-12" />
            <div className="container max-w-full lg:max-w-3xl">
              <div
                // The markdown comes in via the parser wrapped in `div.md-prose`
                // so we don't need to do that here
                ref={mdRef}
                className="md-prose"
                dangerouslySetInnerHTML={{ __html: post.html }}
              />
              <hr />
            </div>
          </div>
        </div>
      </div>

      <div className="container m-auto mb-12 mt-24 max-w-lg">
        <h3 className="mb-6 text-xl font-bold lg:text-3xl">
          Get updates on the latest Remix news
        </h3>
        <div className="mb-6" id="newsletter-text">
          Be the first to learn about new Remix features, community events, and
          tutorials.
        </div>
        <Subscribe descriptionId="newsletter-text" />
      </div>
    </>
  );
}
