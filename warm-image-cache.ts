// Runs during `docker build` to fill the asset server's transform cache. With
// fingerprinting on, rendering an image URL runs its sharp transform, so a cold
// cache made a fresh machine resize every blog image inside its first /blog
// request (~20s on one shared CPU). This uses the same functions the blog
// routes call, so the cache keys match what production renders.
//
// Pass blog post slugs as arguments to warm only those posts.
import { getBlogPost, getBlogPostListings } from "./app/data/blog.ts";
import { assets } from "./app/utils/assets.ts";
import {
  getAuthorImageAsset,
  getBlogImageAsset,
  getFailedImageSources,
} from "./app/utils/blog-image-assets.ts";

const start = performance.now();
const slugs = process.argv.slice(2);
const listings = getBlogPostListings().filter(
  ({ slug }) => slugs.length === 0 || slugs.includes(slug),
);
if (listings.length === 0) {
  throw new Error(`No blog posts match ${slugs.join(", ")}`);
}

// One post at a time keeps sharp's memory bounded; each post's widths still
// resize in parallel.
for (let { slug } of listings) {
  // Rendering the post also resolves the images inside its Markdown.
  let post = await getBlogPost(slug);
  if (!post) throw new Error(`Listed blog post "${slug}" could not be loaded`);
  await Promise.all([
    getBlogImageAsset(post.image),
    ...post.authors.map((author) => getAuthorImageAsset(author.avatar)),
  ]);
}

await assets.close();

// Failed images fall back to the original source at runtime, which would ship
// a partial cache. Fail the build instead.
const failedSources = getFailedImageSources();
if (failedSources.length > 0) {
  throw new Error(
    `Failed to warm ${failedSources.length} blog image(s): ${failedSources.join(", ")}`,
  );
}

console.log(
  `Warmed blog images for ${listings.length} posts in ${Math.round(performance.now() - start)} ms`,
);
