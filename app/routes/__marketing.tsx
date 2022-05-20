/**
 * Any marketing pages that should be forced into dark mode can be added as child
 * routes to `routes/_marketing` and they'll automatically be dark mode, don't
 * use any `dark:` variants, just style the pages with the colors in the
 * designs.
 */
import { Outlet } from "@remix-run/react";

import { Header } from "~/components/header";
import { Footer } from "~/components/footer";

export let handle = { forceDark: true };

export default function Marketing() {
  return (
    <div className="flex flex-col flex-1 h-full">
      <Header forceDark={true} />
      <main className="flex flex-col flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer forceDark={true} />
    </div>
  );
}
