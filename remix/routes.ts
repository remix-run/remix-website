import { route } from "remix/fetch-router/routes";

export let routes = route({
  home: "/",
  brand: "/brand",
  newsletter: "/newsletter",
  blog: "/blog",
  blogPost: "/blog/:slug",
  jam2025: "/jam/2025",
  healthcheck: "/healthcheck",
  blogRss: "/blog/rss.xml",
  blogOgImage: "/img/:slug",
  actions: route("_actions", {
    newsletter: { method: "POST", pattern: "/newsletter" },
  }),
});
