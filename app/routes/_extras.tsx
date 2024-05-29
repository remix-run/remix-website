import { Outlet } from "@remix-run/react";
import { unstable_defineLoader as defineLoader } from "@remix-run/node";
import { CACHE_CONTROL } from "~/lib/http.server";
import { DocSearchModal } from "~/ui/docsearch";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";

export const loader = defineLoader(async ({ response }) => {
  response.headers.set("Cache-Control", CACHE_CONTROL.DEFAULT);
  return null;
});

export default function ExtrasLayout() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <DocSearchModal />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
