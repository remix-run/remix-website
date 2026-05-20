import { createController } from "remix/router";

import { routes } from "../routes.ts";
import { assetServer } from "../utils/assets.server.ts";
import { blogHandler } from "./blog.tsx";
import { blogOgImageHandler } from "./blog-og-image.tsx";
import { blogPostHandler } from "./blog-post.tsx";
import { blogRssHandler } from "./blog-rss.ts";
import { brandHandler } from "./brand.tsx";
import { remix3ActiveDevelopmentHandler } from "./remix3-active-development.tsx";
import { homeHandler } from "./home.tsx";
import { newsletterHandler } from "./newsletter.tsx";
import { newsletterSubscribeHandler } from "./newsletter-subscribe.tsx";

export default createController(routes, {
  actions: {
    async assets({ request }) {
      return (
        (await assetServer.fetch(request)) ??
        new Response("Not found", { status: 404 })
      );
    },

    // Keep healthcheck on a stable path during migration so deploy checks never
    // depend on the in-progress Remix route asset strategy.
    healthcheck() {
      return new Response("OK", {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    },

    blogRss: blogRssHandler,
    blogOgImage: blogOgImageHandler,
    blogPost: blogPostHandler,
    blog: blogHandler,
    brand: brandHandler,
    home: homeHandler,
    newsletter: newsletterHandler,
    newsletterSubscribe: newsletterSubscribeHandler,
    remix3ActiveDevelopment: remix3ActiveDevelopmentHandler,
  },
});
