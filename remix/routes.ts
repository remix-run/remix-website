import { route } from "remix/fetch-router/routes";

export let routes = route({
  home: "/",
  brand: "/brand",
  blog: "/blog",
  jam2025: "/jam/2025",
  healthcheck: "/healthcheck",
  blogRss: "/blog/rss.xml",
  actions: route("_actions", {
    newsletter: { method: "POST", pattern: "/newsletter" },
  }),
  dev: route({
    remixTest: "/remix-test",
  }),
});
