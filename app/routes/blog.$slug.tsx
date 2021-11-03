import { json, LoaderFunction, useLoaderData } from "remix";
import { getBlogPost } from "~/utils/md";
import type { MarkdownPost } from "~/utils/md";
import mdStyles from "~/styles/md.css";

export let loader: LoaderFunction = async ({ params }) => {
  let post: MarkdownPost = await getBlogPost(params.slug!);
  return json(post);
};

export function links() {
  return [{ rel: "stylesheet", href: mdStyles }];
}

export let meta = ({
  data,
  params,
}: {
  data: MarkdownPost;
  params: { slug: string };
}) => {
  let url = `https://remix.run/blog/${params.slug}`;

  // TODO: Dynamically generate these from post titles and header images...
  let socialImage = `/blog-images/social/${params.slug}.jpg`;

  return {
    title: data.title + " | Remix",
    "og:url": url,
    "og:title": data.title,
    "og:image": socialImage,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": data.title,
    "twitter:image": socialImage,
    "twitter:image:alt": data.imageAlt,
  };
};

export default function BlogPost() {
  let post = useLoaderData<MarkdownPost>();
  return (
    <div className="flex-1">
      <div>
        <div className="h-[280px] md:h-[400px] md:max-w-3xl md:mx-auto md:rounded-xl xl:h-[480px] relative bg-gray-900">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover object-top opacity-30 md:rounded-xl"
              src={post.image}
              alt={post.imageAlt}
            />
          </div>
          <div className="pt-6 md:pt-12 relative z-10 container lg:max-w-4xl flex flex-col h-full w-full">
            <div className="flex-1">
              <div className="text-2xs md:text-xs uppercase text-gray-300">
                {post.date}
              </div>
              <div className="h-2" />
              <div className="font-display text-2xl text-white md:text-4xl">
                {post.title}
              </div>
              <div className="h-2" />
            </div>
            <div className="pb-4 md:pb-12">
              {post.authors.map(author => (
                <div key={author.name} className="flex items-center my-2">
                  <div>
                    <img
                      className="h-10 w-10 md:h-14 md:w-14 rounded-full"
                      src={author.avatar}
                      aria-hidden
                    />
                  </div>
                  <div className="w-6" />
                  <div>
                    <div className="font-display text-base md:text-xl leading-none text-white">
                      {author.name}
                    </div>
                    <div className="text-xs md:text-xs leading-tight text-gray-300">
                      {author.bio}
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
            className="md-prose"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </div>
      </div>
    </div>
  );
}
