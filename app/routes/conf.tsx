import { Outlet } from "@remix-run/react";
import { unstable_defineLoader as defineLoader } from "@remix-run/node";
import { CACHE_CONTROL } from "~/lib/http.server";

export const handle = { forceDark: true };

export const loader = defineLoader(async ({ response }) => {
  response.headers.set("Cache-Control", CACHE_CONTROL.conf);
  return null;
});

export default function Conf() {
  return <Outlet />;
}
