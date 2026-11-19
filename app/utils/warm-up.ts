import { setTimeout as sleep } from "node:timers/promises";
import type { Router } from "remix/router";

import { getBlogPostListings } from "../data/blog.ts";
import { routes } from "../routes.ts";

/**
 * Renders the busiest pages before the server listens. Fly routes traffic to a
 * machine only after its health checks pass, so the first visitors after a
 * deploy or restart don't wait on cold module compilation, Shiki, and script
 * graphs. Blog images are already cached at build time by
 * `warm-image-cache.ts`. Failures are logged and never block startup, and
 * warm-up gives up after 20s so a throttled machine still listens long before
 * Fly's TCP check restarts it (10s grace + 6 × 15s).
 */
export async function warmServer(
  router: Pick<Router, "fetch">,
  origin: string,
) {
  let start = performance.now();
  let renderPages = (async () => {
    let latestPost = getBlogPostListings()[0];
    let pathnames = [
      routes.home.href(),
      routes.blog.index.href(),
      ...(latestPost ? [routes.blog.post.href({ slug: latestPost.slug })] : []),
      routes.jam.y2026.index.href(),
    ];

    for (let pathname of pathnames) {
      try {
        let response = await router.fetch(
          new Request(new URL(pathname, origin), {
            headers: { Accept: "text/html" },
            signal: AbortSignal.timeout(15_000),
          }),
        );
        await response.arrayBuffer();
        if (!response.ok) {
          console.warn(
            `Warm-up request for ${pathname} returned ${response.status}`,
          );
        }
      } catch (error) {
        console.error(`Warm-up request for ${pathname} failed`, error);
      }
    }
  })();

  // Abort signals don't stop work that runs before rendering starts, so race
  // a timer to guarantee the deadline.
  let warmedUp = await Promise.race([
    renderPages.then(
      () => true,
      (error: unknown) => {
        console.error("Warm-up failed", error);
        return true;
      },
    ),
    sleep(20_000, false, { ref: false }),
  ]);

  if (warmedUp) {
    console.log(`Warmed up in ${Math.round(performance.now() - start)} ms`);
  } else {
    console.warn("Warm-up exceeded 20s; listening anyway");
  }
}
