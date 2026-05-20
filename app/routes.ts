import { form, get, post, route } from "remix/routes";

export let showJam2026 =
  typeof process === "undefined" || process.env?.NODE_ENV !== "production";

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
  home: get("/"),
  remix3ActiveDevelopment: get("/remix-3-active-development"),
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
      tickets: form("tickets"),
    }),
  }),
  newsletter: get("/newsletter"),
});

export let enabledRoutes = {
  ...routes,
  jam: showJam2026
    ? routes.jam
    : {
        index: routes.jam.index,
        y2025: routes.jam.y2025,
      },
};
