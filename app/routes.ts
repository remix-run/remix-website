import { form, get, post, route } from "remix/routes";

export let routes = route({
  assets: get("/assets/*path"),
  blog: route("blog", {
    index: get("/"),
    rss: get("rss.xml"),
    post: get(":slug(.:ext)"),
  }),
  blogOgImage: get("/img/:slug"),
  brand: get("/brand"),
  healthcheck: get("/healthcheck"),
  home: get("/"),
  remixHistory: route("remix-history", {
    index: get("/"),
  }),
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
      ticket: form("ticket"),
    }),
    y2026: route("2026", {
      index: get("/"),
      theme: post("theme"),
      ticket: form("ticket"),
    }),
  }),
  newsletter: route("newsletter", {
    index: get("/"),
    subscribe: post("/"),
    issue: get(":number"),
    image: get(":number/image/:filename"),
  }),
});
