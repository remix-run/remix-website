import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("*", "routes/catchall.tsx"),
] satisfies RouteConfig;
