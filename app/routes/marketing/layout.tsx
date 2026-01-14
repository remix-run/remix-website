import { Outlet, type HeadersFunction } from "react-router";
import { DocSearchModal } from "~/ui/docsearch";
import { Header } from "~/ui/header";
import { Footer } from "~/ui/footer";
import { CACHE_CONTROL } from "~/lib/http.server";

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function Marketing() {
  return (
    <>
      <DocSearchModal />
      <Header />
      <main className="flex flex-1 flex-col" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
