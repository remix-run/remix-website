import { get, post, route } from "remix/fetch-router/routes";

export let routes = route({
  actions: route("_actions", {
    newsletter: post("/newsletter"),
  }),
  assets: get("/assets/*path"),
  blog: get("/blog"),
  blogOgImage: get("/img/:slug"),
  blogPost: get("/blog/:slug(.:ext)"),
  blogRss: get("/blog/rss.xml"),
  brand: get("/brand"),
  healthcheck: get("/healthcheck"),
  remix3ActiveDevelopment: get("/"),
  jam: route("jam", {
    index: get("/"),
    y2025: route("2025", {
      index: get("/"),
      coc: get("coc"),
      faq: get("faq"),
      gallery: route("gallery", {
        index: get("/"),
        download: get("download"),
      }),
      lineup: get("lineup"),
      ticket: get("ticket"),
    }),
  }),
  newsletter: get("/newsletter"),
});
