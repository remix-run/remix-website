import * as React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useRouteError,
  data,
  redirect,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import {
  load as loadFathom,
  type LoadOptions as FathomLoadOptions,
} from "fathom-client";
import "~/styles/tailwind.css";
import "~/styles/bailwind.css";
import { removeTrailingSlashes, isProductionHost } from "~/lib/http.server";
import { ColorSchemeScript, useColorScheme } from "~/lib/color-scheme";
import { parseColorScheme } from "~/lib/color-scheme.server";
import iconsHref from "~/icons.svg";
import cx from "clsx";
import { canUseDOM } from "./ui/primitives/utils";
import { GlobalLoading } from "./ui/global-loading";
import { Route } from "./+types/root";

/**
 * In preparation for using `remix` repo's `main` branch for v3 development,
 * we've deployed the latest v2 docs at https://v2.remix.run/docs .
 * Docs for specific versions of v0, v1, and v2 can be found on the `remix` repo within the `docs/` folder at the corresponding GitHub tag for that version.
 *
 * This middleware redirects requests for specific v0,v1, or v2 versions of the docs to GitHub
 * and redirects requests for `main` and `dev` to the new static v2 docs site (https://v2.remix.run/docs).
 */
const v2DocsMiddleware: Route.unstable_MiddlewareFunction = ({ request }) => {
  // https://github.com/remix-run/remix/tree/remix%402.17.0/docs
  const { pathname } = new URL(request.url);

  const segments = pathname.split("/").slice(1);
  if (segments[0] !== "docs") return;

  const [lang, ref, ...path] = segments.slice(1);
  const doc = path.length > 0 ? path.join("/") + ".md" : "";

  if (lang === "en") {
    // /docs/en/v0.x -> github
    // /docs/en/v1.x -> github
    if (ref.startsWith("v0.") || ref.startsWith("v1.")) {
      // We switched from `vx.y.z` tags to `remix@x.y.z` after v1.6.4 release
      // So here we use leading `v` in docs ref to detect that older tag format
      //
      // See:
      // - https://remix.run/docs/en/v1.6.4
      // - https://remix.run/docs/en/1.6.5
      //
      // - https://github.com/remix-run/remix/releases/tag/v1.6.4
      // - https://github.com/remix-run/remix/releases/tag/remix%401.6.5

      // todo: remove leading `v` from newer versions like v1.6.5??
      throw redirect(
        `https://github.com/remix-run/remix/tree/${ref}/docs/${doc}`,
      );
    }

    // /docs/en/0.x -> github
    // /docs/en/1.x -> github
    // /docs/en/2.x -> github
    if (ref.startsWith("0.") || ref.startsWith("1.") || ref.startsWith("2.")) {
      throw redirect(
        `https://github.com/remix-run/remix/tree/remix%40${ref}/docs/${doc}`,
      );
    }

    // /docs/en/main -> v2.remix.run
    // /docs/en/dev -> v2.remix.run
    if (ref === "main" || ref === "dev") {
      throw redirect(`https://v2.remix.run/docs/${doc}`);
    }

    // /docs/* -> v2.remix.run
    throw redirect(`https://v2.remix.run${pathname}`);
  }
};

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  v2DocsMiddleware,
];

export async function loader({ request }: LoaderFunctionArgs) {
  removeTrailingSlashes(request);

  let isDevHost = !isProductionHost(request);
  let url = new URL(request.url);

  let colorScheme = await parseColorScheme(request);

  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  return data(
    {
      colorScheme,
      host: url.host,
      siteUrl,
      isProductionHost: !isDevHost,
      noIndex:
        isDevHost ||
        url.pathname === "/docs/en/v1/api/remix" ||
        url.pathname === "/docs/en/v1/api/conventions",
    },
    {
      headers: {
        Vary: "Cookie",
      },
    },
  );
}

export function links() {
  let preloadedFonts = [
    "inter-roman-latin-var.woff2",
    "inter-italic-latin-var.woff2",
    "source-code-pro-roman-var.woff2",
    "source-code-pro-italic-var.woff2",
  ];
  return [
    { rel: "icon", href: "/favicon-32.png", sizes: "32x32" },
    { rel: "icon", href: "/favicon-128.png", sizes: "128x128" },
    { rel: "icon", href: "/favicon-180.png", sizes: "180x180" },
    { rel: "icon", href: "/favicon-192.png", sizes: "192x192" },
    { rel: "apple-touch-icon", href: "/favicon-180.png", sizes: "180x180" },
    ...preloadedFonts.map((font) => ({
      rel: "preload",
      as: "font",
      href: `/font/${font}`,
      crossOrigin: "anonymous",
    })),
    { rel: "alternate", type: "application/rss+xml", href: "/blog/rss.xml" },
  ];
}

interface DocumentProps {
  title?: string;
  forceDark?: boolean;
  darkBg?: string;
  isDev?: boolean;
  noIndex: boolean;
  children: React.ReactNode;
}

function Document({
  children,
  title,
  forceDark,
  darkBg,
  noIndex,
  isDev,
}: DocumentProps) {
  let colorScheme = useColorScheme();
  let matches = useMatches();
  let isDocsPage = !!matches.find((match) =>
    match.id.startsWith("routes/docs"),
  );

  return (
    <html
      lang="en"
      className={cx({
        dark: forceDark || colorScheme === "dark",
        "scroll-pt-[6rem] lg:scroll-pt-[4rem]": isDocsPage,
      })}
      data-theme={forceDark ? "dark" : colorScheme}
    >
      <head>
        <ColorSchemeScript forceConsistentTheme={forceDark} />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#121212" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        {noIndex && <meta name="robots" content="noindex" />}
        <Links />
        <Meta />
        {title && <title data-title-override="">{title}</title>}
      </head>

      <body
        className={cx(
          "flex min-h-screen w-full flex-col overflow-x-hidden antialiased selection:bg-blue-200 selection:text-black dark:selection:bg-blue-800 dark:selection:text-white",
          forceDark
            ? [darkBg || "bg-gray-900", "text-gray-200"]
            : "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-200",
        )}
      >
        <GlobalLoading />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  let matches = useMatches();
  let { noIndex } = useLoaderData<typeof loader>();
  let forceDark = matches.some(({ handle }) => {
    if (handle && typeof handle === "object" && "forceDark" in handle) {
      return handle.forceDark;
    }
    return false;
  });

  if (process.env.NODE_ENV !== "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFathomClient("IRVDGCHK", {
      url: "https://cdn.usefathom.com/script.js",
      spa: "history",
      excludedDomains: ["localhost"],
    });
  }

  return (
    <Document
      noIndex={noIndex}
      forceDark={forceDark}
      isDev={process.env.NODE_ENV === "development"}
    >
      <Outlet />
      <img
        src={iconsHref}
        alt=""
        hidden
        // this img tag simply forces the icons to be loaded at a higher
        // priority than the scripts (chrome only for now)
        // @ts-expect-error -- silly React pretending this attribute doesn't exist
        // eslint-disable-next-line react/no-unknown-property
        fetchpriority="high"
      />
    </Document>
  );
}

export function ErrorBoundary() {
  let error = useRouteError();
  if (!canUseDOM) {
    console.error(error);
  }

  if (isRouteErrorResponse(error)) {
    return (
      <Document
        noIndex
        title={error.statusText}
        forceDark
        darkBg="bg-blue-brand"
      >
        <div className="flex flex-1 flex-col justify-center text-white">
          <div className="text-center leading-none">
            <h1 className="font-mono text-[25vw]">{error.status}</h1>
            <a
              className="inline-block text-[8vw] underline"
              href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${error.status}`}
            >
              {error.statusText}
            </a>
          </div>
        </div>
      </Document>
    );
  }

  return (
    <Document noIndex title="Error" forceDark darkBg="bg-red-brand">
      <div className="flex flex-1 flex-col justify-center text-white">
        <div className="text-center leading-none">
          <h1 className="text-[25vw]">Error</h1>
          <div className="text-3xl">
            Something went wrong! Please try again later.
          </div>
        </div>
      </div>
    </Document>
  );
}

function useFathomClient(siteId: string, loadOptions: FathomLoadOptions) {
  let loaded = React.useRef(false);
  React.useEffect(() => {
    if (loaded.current) return;
    loadFathom(siteId, loadOptions);
    loaded.current = true;
  }, [loadOptions, siteId]);
}
