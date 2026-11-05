// Runs during `docker build` to fill the asset server's transform cache. With
// fingerprinting on, rendering an image URL runs its sharp transform, so a cold
// cache made a fresh machine resize every blog image inside its first /blog
// request (~20s on one shared CPU). This uses the same functions the blog
// routes call, so the cache keys match what production renders.
import { getBlogPost, getBlogPostListings } from "./app/data/blog.ts";
import { assets } from "./app/utils/assets.ts";
import {
  getAuthorImageAsset,
  getBlogImageAsset,
} from "./app/utils/blog-image-assets.ts";

// `createImageAsset` logs failures and falls back to the original image, which
// would ship a partial cache. Count those logs so the build fails instead.
let errorCount = 0;
let logError = console.error;
console.error = (...args: unknown[]) => {
  errorCount++;
  logError(...args);
};

let start = performance.now();
let listings = getBlogPostListings();

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

if (errorCount > 0) {
  throw new Error(
    `Failed to warm ${errorCount} blog image(s); see errors above`,
  );
}

console.log(
  `Warmed blog images for ${listings.length} posts in ${Math.round(performance.now() - start)} ms`,
);
