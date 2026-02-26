import { Document } from "../components/document";
import { Footer } from "../components/home/footer";
import { Header } from "../components/home/header";
import { NewsletterSubscribeForm } from "../assets/newsletter-subscribe";
import { routes } from "../routes";
import { render } from "../utils/render";
import { getBlogPostListings } from "../lib/blog.server";
import { CACHE_CONTROL } from "../../shared/cache-control";

export async function blogHandler() {
  let posts = await getBlogPostListings();
  return render.document(<Page posts={posts} />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}

function Page() {
  return (props: {
    posts: Awaited<ReturnType<typeof getBlogPostListings>>;
  }) => (
    <Document
      title="Remix Blog"
      description="Thoughts about building excellent user experiences with Remix."
    >
      <Header />
      <main class="flex flex-1 flex-col" tabIndex={-1}>
        <BlogPageContent posts={props.posts} />
      </main>
      <Footer />
    </Document>
  );
}

function BlogPageContent() {
  return (props: {
    posts: Awaited<ReturnType<typeof getBlogPostListings>>;
  }) => {
    let [latestPost, ...posts] = props.posts;
    let featuredPosts = props.posts.filter((post) => post.featured);

    return (
      <div class="mt-8 flex flex-1 flex-col px-12">
        <div class="mx-auto w-full max-w-[1400px]">
          <div class="md:grid md:grid-cols-12">
            <div class="md:col-span-7">
              {latestPost ? (
                <div class="mb-14">
                  <a href={routes.blogPost.href({ slug: latestPost.slug })}>
                    <div class="mb-6 aspect-[16/9]">
                      <img
                        class="mb-6 h-full w-full object-cover object-top shadow md:rounded-md"
                        src={latestPost.image}
                        alt={latestPost.imageAlt}
                      />
                    </div>
                    <p class="text-sm lg:text-base">{latestPost.dateDisplay}</p>
                    <p class="py-4 text-2xl font-bold leading-[1.1] lg:text-5xl lg:leading-[1.1]">
                      {latestPost.title}
                    </p>
                    <p class="text-sm lg:text-base">{latestPost.summary}</p>
                  </a>
                </div>
              ) : null}

              <div class="mt-12 lg:grid lg:grid-cols-2 lg:gap-6">
                {posts.map((post) => (
                  <div key={post.slug}>
                    <a href={routes.blogPost.href({ slug: post.slug })}>
                      <div class="mb-6 aspect-[16/9]">
                        <img
                          class="h-full w-full object-cover object-top shadow md:rounded-md"
                          src={post.image}
                          alt={post.imageAlt}
                        />
                      </div>
                      <p class="text-sm lg:text-base">{post.dateDisplay}</p>
                      <p class="py-2 text-lg font-bold leading-snug lg:text-xl lg:leading-snug">
                        {post.title}
                      </p>
                      <p class="mb-12 text-sm lg:text-base">{post.summary}</p>
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div class="h-24 md:hidden" />
            <div class="md:col-span-4 md:col-start-9">
              {featuredPosts.length ? (
                <>
                  <h3 class="mb-8 text-xl font-bold lg:text-3xl">
                    Featured Articles
                  </h3>
                  <div class="grid grid-cols-1 gap-4">
                    {featuredPosts.map((post, index, array) => (
                      <div key={post.slug}>
                        <div class="flex flex-col">
                          <div class="flex flex-col">
                            <a
                              href={routes.blogPost.href({ slug: post.slug })}
                              class="text-sm lg:text-base"
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
                <h3 class="mb-6 text-xl font-bold lg:text-3xl">
                  Get updates on the latest Remix news
                </h3>
                <div class="mb-6" id="newsletter-text">
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
