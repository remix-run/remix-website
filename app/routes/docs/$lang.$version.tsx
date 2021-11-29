import * as React from "react";
import invariant from "ts-invariant";
import { json, useLoaderData, Outlet, Link } from "remix";
import type { LoaderFunction } from "remix";
import { useLocation } from "react-router-dom";
import cx from "clsx";
import { DocSearch } from "@docsearch/react";
import docsearchStylesheet from "@docsearch/css/dist/style.css";
import docsearchStylesheetOverrides from "~/styles/docsearch.css";

import { getMenu, MenuNode } from "~/utils/docs/get-menu.server";
import markdownStyles from "~/styles/docs.css";
import { Menu } from "~/components/docs-menu";
import { Wordmark } from "~/components/logo";
import { CACHE_CONTROL } from "~/utils/http";

export let loader: LoaderFunction = async ({ params }) => {
  invariant(!!params.version, "Need a version param");
  invariant(!!params.lang, "Need a lang param");

  let menu: MenuNode[] = await getMenu(params.version, params.lang);
  return json(menu, { headers: { "Cache-Control": CACHE_CONTROL } });
};

export function links() {
  return [
    { rel: "stylesheet", href: markdownStyles },
    { rel: "stylesheet", href: docsearchStylesheet },
    { rel: "stylesheet", href: docsearchStylesheetOverrides },
  ];
}

export default function DocsLayout() {
  let menu = useLoaderData<MenuNode[]>();
  let location = useLocation();
  let detailsRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    let details = detailsRef.current;
    if (details && details.hasAttribute("open")) {
      details.removeAttribute("open");
    }
  }, [location]);

  return (
    <div className="lg:flex lg:h-full px-6">
      {menu.length > 0 ? (
        <div className="lg:hidden">
          <div className="absolute top-6 right-6 flex gap-2 items-center">
            <DocSearch
              appId="6OHWJSR8G4"
              indexName="remix"
              apiKey="dff56670dbec8494409989d6ec9c8ac2"
            />
            <Link
              onContextMenu={(event) => {
                event.preventDefault();
                window.location.href =
                  "https://drive.google.com/drive/u/0/folders/1pbHnJqg8Y1ATs0Oi8gARH7wccJGv4I2c";
              }}
              to="."
            >
              <Wordmark />
            </Link>
          </div>
          <details ref={detailsRef}>
            <summary className="pb-4 pt-6 cursor-pointer">
              Docs Navigation
            </summary>
            <div>
              <Menu nodes={menu} className="py-6 text-d-p-sm font-medium" />
            </div>
          </details>
          <hr className="mb-4" />
        </div>
      ) : null}
      {menu.length > 0 ? (
        <div className="flex-shrink-0 hidden lg:block">
          <div
            className={cx([
              // Sidebar nav scroll container
              "h-full max-h-screen overflow-x-hidden overflow-y-auto", // auto scrolling
              "w-64 xl:w-80 2xl:w-96", // width
              "sticky top-0",
              "py-10 pl-6 pr-3 xl:pr-5 2xl:pr-6", // spacing
            ])}
          >
            <Link
              onContextMenu={(event) => {
                event.preventDefault();
                window.location.href =
                  "https://drive.google.com/drive/u/0/folders/1pbHnJqg8Y1ATs0Oi8gARH7wccJGv4I2c";
              }}
              to="."
            >
              <Wordmark />
            </Link>
            <div className="h-8" />
            <DocSearch
              appId="6OHWJSR8G4"
              indexName="remix"
              apiKey="dff56670dbec8494409989d6ec9c8ac2"
            />
            <div className="h-8" />
            <Menu nodes={menu} />
          </div>
        </div>
      ) : null}
      <div className="lg:z-[1] flex-grow lg:h-full">
        <div className="py-6 md:py-8 lg:py-10 lg:pr-6 lg:pl-3 xl:pl-5 2xl:pl-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function unstable_shouldReload() {
  return false;
}
