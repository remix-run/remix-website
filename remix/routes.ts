import { route } from "remix/fetch-router/routes";

export let routes = route({
  home: "/",
  brand: "/brand",
  newsletter: "/newsletter",
  blog: "/blog",
  blogPost: "/blog/:slug(.:ext)",
  jam: "/jam",
  jam2025: "/jam/2025",
  jam2025Ticket: "/jam/2025/ticket",
  jam2025Lineup: "/jam/2025/lineup",
  jam2025Faq: "/jam/2025/faq",
  jam2025Coc: "/jam/2025/coc",
  jam2025Gallery: "/jam/2025/gallery",
  healthcheck: "/healthcheck",
  blogRss: "/blog/rss.xml",
  blogOgImage: "/img/:slug",
  actions: route("_actions", {
    newsletter: { method: "POST", pattern: "/newsletter" },
  }),
});
