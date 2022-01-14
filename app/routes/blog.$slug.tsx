import * as React from "react";
import {
  Form,
  LoaderFunction,
  useActionData,
  useFetcher,
  useTransition,
} from "remix";
import { json, useLoaderData } from "remix";

import { getBlogPost } from "~/utils/md.server";
import type { MarkdownPost } from "~/utils/md.server";
import mdStyles from "~/styles/md.css";
import { useRef } from "react";
import { useDelegatedReactRouterLinks } from "~/components/delegate-links";
import { CACHE_CONTROL } from "~/utils/http.server";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { Button, Input } from "~/components/buttons";
import { Subscribe } from "~/components/subscribe";

export let loader: LoaderFunction = async ({ params }) => {
  let post: MarkdownPost = await getBlogPost(params.slug!);
  return json(post, { headers: { "Cache-Control": CACHE_CONTROL } });
};

export function links() {
  return [{ rel: "stylesheet", href: mdStyles }];
}

export let meta = ({
  data,
  params,
}: {
  data?: MarkdownPost;
  params: { slug: string };
}) => {
  let url = `https://remix.run/blog/${params.slug}`;

  // TODO: Dynamically generate these from post titles and header images...
  let socialImageUrl = `https://remix.run/blog-images/social/${params.slug}.jpg`;

  if (!data) {
    return {
      title: "Hey Not Found",
    };
  }

  return {
    title: data.title + " | Remix",
    description: data.summary,
    "og:url": url,
    "og:title": data.title,
    "og:image": socialImageUrl,
    "og:description": data.summary,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": data.title,
    "twitter:description": data.summary,
    "twitter:image": socialImageUrl,
    "twitter:image:alt": data.imageAlt,
  };
};

export default function BlogPost() {
  let post = useLoaderData<MarkdownPost>();
  let mdRef = useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(mdRef);

  return (
    <div className="flex flex-col flex-1 h-full">
      <Header to="/blog" />
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
              <div
                ref={mdRef}
                className="md-prose"
                dangerouslySetInnerHTML={{ __html: post.html }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 mb-12 w-96 m-auto">
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
