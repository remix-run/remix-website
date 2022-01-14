import * as React from "react";
import type { LoaderFunction, MetaFunction } from "remix";
import { json, useLoaderData, Link, useTransition, useActionData } from "remix";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";
import { Subscribe } from "~/components/subscribe";
import type { MarkdownPostListing } from "~/utils/md.server";
import { getBlogPostListings } from "~/utils/md.server";

type LoaderData = { posts: Array<MarkdownPostListing> };

export let meta: MetaFunction = () => {
  return {
    title: "Remix Blog",
    description:
      "Thoughts about building excellent user experiences with Remix.",
  };
};

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({
    posts: await getBlogPostListings(),
  });
};

export default function Blog() {
  const data = useLoaderData<LoaderData>();
  const [latestPost, ...posts] = data.posts;

  let transition = useTransition();
  let actionData = useActionData();
  let inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (transition.state === "idle" && actionData?.ok && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [transition.state, actionData]);

  return (
    <div className="flex flex-col flex-1 h-full">
      <Header />
      <main
        className="flex flex-col flex-1 container mt-16 lg:mt-32"
        tabIndex={-1}
      >
        <div className="md:grid md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="mb-14">
              <Link to={latestPost.slug} prefetch="intent">
                <div className="aspect-h-9 aspect-w-16 mb-6">
                  <img
                    className="object-cover object-top w-full h-full md:rounded-md mb-6"
                    src={latestPost.image}
                    alt={latestPost.imageAlt}
                  />
                </div>
                <p className="text-m-p-sm lg:text-d-p-sm">
                  {latestPost.dateDisplay}
                </p>
                <p className="text-m-h2 font-bold lg:text-d-h2">
                  {latestPost.title}
                </p>
                <p className="text-m-p-sm lg:text-d-p-sm">
                  {latestPost.summary}
                </p>
              </Link>
            </div>
            <div className="mt-12 lg:grid lg:grid-cols-2 lg:gap-6">
              {posts.map((post) => (
                <div key={post.slug}>
                  <Link to={post.slug} prefetch="intent">
                    <div className="aspect-h-9 aspect-w-16 mb-6">
                      <img
                        className="object-cover object-top h-full w-full md:rounded-md"
                        src={post.image}
                        alt={post.imageAlt}
                      />
                    </div>
                    <p className="text-m-p-sm lg:text-d-p-sm">
                      {post.dateDisplay}
                    </p>
                    <p className="text-m-p-lg font-bold lg:text-d-p-lg">
                      {post.title}
                    </p>
                    <p className="text-m-p-sm lg:text-d-p-sm mb-12">
                      {post.summary}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="md:hidden h-24" />
          <div className="md:col-span-4 md:col-start-9">
            <h3 className="text-m-h3 font-bold mb-8 lg:text-d-h3">
              Featured Articles
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {data.posts.map((post, index, array) => (
                <React.Fragment key={post.slug}>
                  <div className="flex flex-col">
                    <div className="flex flex-col">
                      <Link
                        to={post.slug}
                        prefetch="intent"
                        className="text-m-p-sm lg:text-d-p-sm"
                      >
                        {post.title}
                      </Link>
                    </div>
                  </div>
                  {index !== array.length - 1 && <hr className="my-4" />}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-24">
              <h3 className="text-m-h3 font-bold mb-6 lg:text-d-h3">
                Get updates on the latest Remix news
              </h3>
              <div className="mb-6" id="newsletter-text">
                Be the first to learn about new Remix features, community
                events, and tutorials.
              </div>
              <Subscribe descriptionId="newsletter-text" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
