import type {
  HeadersFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import invariant from "ts-invariant";

import { getBlogPost } from "~/utils/md.server";
import type { BlogPost as MarkdownPost } from "~/utils/md.server";
import mdStyles from "~/styles/md.css";
import { useRef } from "react";
import { useDelegatedReactRouterLinks } from "~/components/delegate-links";
import { CACHE_CONTROL } from "~/utils/http.server";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { Subscribe } from "~/components/subscribe";

export let loader: LoaderFunction = async ({ params, request }) => {
  let { slug } = params;
  invariant(!!slug, "Expected slug param");
  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  let post = await getBlogPost(slug);
  return json<LoaderData>(
    { siteUrl, post },
    { headers: { "Cache-Control": CACHE_CONTROL } }
  );
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL,
  };
};

export function links() {
  return [{ rel: "stylesheet", href: mdStyles }];
}

export let meta: MetaFunction = ({ data, params }) => {
  let { slug } = params;
  invariant(!!slug, "Expected slug param");

  let { siteUrl, post } = data as LoaderData;
  // we should never get here since our loader throws a 404 :shrug:
  if (!post) {
    return {
      title: "Hey Not Found",
    };
  }

  let socialImageUrl = `${siteUrl}/img/social?${new URLSearchParams({
    slug,
    siteUrl,
    title: post.title,
    authorName: post.authors[0]?.name || "Michael Jackson",
    authorTitle: post.authors[0]?.title || "Co-Founder, CEO",
    date: post.dateDisplay,
  })}`;

  let url = `${siteUrl}/blog/${slug}`;

  return {
    title: post.title + " | Remix",
    description: post.summary,
    "og:url": url,
    "og:title": post.title,
    "og:image": socialImageUrl || undefined,
    "og:description": post.summary,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": post.title,
    "twitter:description": post.summary,
    "twitter:image": socialImageUrl || undefined,
    "twitter:image:alt": socialImageUrl ? post.imageAlt : undefined,
  };
};

export default function BlogPost() {
  let { post } = useLoaderData<LoaderData>();
  let mdRef = useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(mdRef);

  return (
    <div className="flex flex-col flex-1 h-full">
      <Header to="/blog" />
      {post.draft ? (
        <div className="m-auto max-w-3xl bg-red-700 text-gray-100 dark:bg-red-400 dark:text-gray-700 mb-8 py-3 px-5 rounded-sm text-center">
          🚨 This is a draft, please do not share this page until it's
          officially published 🚨
        </div>
      ) : null}
      <div className="flex flex-col flex-1">
        <div className="flex-1">
          <div>
            <div className="h-[280px] md:h-[400px] md:max-w-3xl md:mx-auto md:rounded-xl xl:h-[480px] relative bg-gray-900">
              <div className="absolute inset-0">
                <img
                  className="object-cover object-top w-full h-full opacity-40 md:rounded-xl"
                  src={post.image}
                  alt={post.imageAlt}
                />
              </div>
              <div className="container relative z-10 flex flex-col w-full h-full pt-6 md:pt-12 lg:max-w-4xl">
                <div className="flex-1">
                  <div className="text-gray-200 uppercase text-m-p-sm md:text-d-p-sm">
                    {post.dateDisplay}
                  </div>
                  <div className="h-2" />
                  <div className="text-m-h1 text-white font-display md:text-4xl">
                    {post.title}
                  </div>
                  <div className="h-2" />
                </div>
                <div className="pb-4 md:pb-12">
                  {post.authors.map((author) => (
                    <div key={author.name} className="flex items-center my-2">
                      <div>
                        <img
                          className="w-10 h-10 rounded-full md:h-14 md:w-14"
                          src={author.avatar}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="w-6" />
                      <div>
                        <div className="text-d-p-lg leading-none text-white font-display md:text-d-h3">
                          {author.name}
                        </div>
                        <div className="text-d-p-sm leading-tight text-gray-200 md:text-d-p-sm">
                          {author.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-12" />
            <div className="container lg:max-w-3xl">
              {/* The markdown comes in via the parser wrapped in `div.md-prose`
                  so we don't need to do that here */}
              <div
                ref={mdRef}
                dangerouslySetInnerHTML={{ __html: post.html }}
              />
              <hr />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 mb-12 m-auto container sm:w-96">
        <h3 className="text-m-h3 font-bold mb-6 lg:text-d-h3">
          Get updates on the latest Remix news
        </h3>
        <div className="mb-6" id="newsletter-text">
          Be the first to learn about new Remix features, community events, and
          tutorials.
        </div>
        <Subscribe descriptionId="newsletter-text" />
      </div>
      <Footer />
    </div>
  );
}

interface LoaderData {
  siteUrl: string;
  post: MarkdownPost;
}
