import type { HeadersFunction } from "react-router";
import { Outlet } from "react-router";
import { CACHE_CONTROL } from "~/lib/http.server";
import { DocSearchModal } from "~/ui/docsearch";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

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
