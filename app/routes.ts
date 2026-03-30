import { post, route } from "remix/fetch-router/routes";

export let routes = route({
  actions: route("_actions", {
    newsletter: post("/newsletter"),
  }),
  blog: "/blog",
  blogOgImage: "/img/:slug",
  blogPost: "/blog/:slug(.:ext)",
  blogRss: "/blog/rss.xml",
  brand: "/brand",
  healthcheck: "/healthcheck",
  home: "/",
  jam: "/jam",
  jam2025: "/jam/2025",
  jam2025Coc: "/jam/2025/coc",
  jam2025Faq: "/jam/2025/faq",
  jam2025Gallery: "/jam/2025/gallery",
  jam2025GalleryDownload: "/jam/2025/gallery/download",
  jam2025Lineup: "/jam/2025/lineup",
  jam2025Ticket: "/jam/2025/ticket",
  newsletter: "/newsletter",
});
