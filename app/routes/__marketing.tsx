/**
 * Any marketing pages that should be forced into dark mode can be added as child
 * routes to `routes/_marketing` and they'll automatically be dark mode, don't
 * use any `dark:` variants, just style the pages with the colors in the
 * designs.
 */

import { Outlet } from "remix";

export let handle = { forceDark: true };

export default function Marketing() {
  return <Outlet />;
}
