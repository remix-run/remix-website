import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("jam", "routes/jam/pages/layout.tsx", [
    route("2025", "routes/jam/pages/2025.tsx"),
    route("2025/ticket", "routes/jam/pages/2025.ticket.tsx"),
    route("2025/lineup", "routes/jam/pages/2025.lineup.tsx"),
    route("2025/faq", "routes/jam/pages/2025.faq.tsx"),
    route("2025/coc", "routes/jam/pages/2025.coc.tsx"),
    route("2025/gallery", "routes/jam/pages/2025.gallery.tsx"),
  ]),

  route("_actions/newsletter", "routes/resources/newsletter-subscribe.tsx"),

  route("*", "routes/catchall.tsx"),
] satisfies RouteConfig;
