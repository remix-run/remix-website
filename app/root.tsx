import * as React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  useMatches,
  data,
  redirect,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import semver from "semver";
import {
  load as loadFathom,
  type LoadOptions as FathomLoadOptions,
} from "fathom-client";

import "../shared/tailwind.css";
import "../shared/bailwind.css";
import "../shared/marketing.css";
import { removeTrailingSlashes, isProductionHost } from "~/lib/http.server";
import iconsHref from "~/icons.svg";
import cx from "clsx";
import { canUseDOM, useLayoutEffect } from "./ui/primitives/utils";
import { GlobalLoading } from "./ui/global-loading";
import { type Route } from "./+types/root";

const redirectOldDocs: Route.MiddlewareFunction = ({ request }) => {
  const { pathname } = new URL(request.url);

  if (pathname === "/docs") {
    throw redirect(`https://v2.remix.run/docs`);
  }

  if (!pathname.startsWith("/docs/")) {
    return;
  }

  const fullPathWithoutDocs = pathname.split("/").slice(2);
  const [lang, ref, ...path] = fullPathWithoutDocs;

  if (lang === "en") {
    // Redirect specific versions to GitHub docs at the corresponding tag
    const version = semver.clean(ref);
    if (version !== null) {
      // We switched from `v.x.y.z` to `remix@x.y.z` GitHub tags starting at v1.6.5
      const tag = semver.lte(version, "1.6.4")
        ? `v${version}`
        : `remix@${version}`;

      const markdownDoc = path.length > 0 ? path.join("/") + ".md" : "";
      throw redirect(
        `https://github.com/remix-run/remix/tree/${encodeURIComponent(tag)}/docs/${markdownDoc}`,
      );
    }

    // /docs/en/<branch>/* -> v2.remix.run/docs/*
    if (ref === "main" || ref === "dev") {
      throw redirect(`https://v2.remix.run/docs/${path.join("/")}`);
    }

    // Fallback: /docs/en/* -> v2.remix.run/docs/*
    throw redirect(`https://v2.remix.run/docs/${ref}/${path.join("/")}`);
  } else {
    // Fallback /docs/* -> v2.remix.run/docs/*
    throw redirect(
      `https://v2.remix.run/docs/${fullPathWithoutDocs.join("/")}`,
    );
  }
};

const redirectResources: Route.MiddlewareFunction = ({ request }) => {
  const { pathname, search } = new URL(request.url);

  if (pathname === "/resources" || pathname.startsWith("/resources/")) {
    throw redirect(`https://v2.remix.run/${pathname + search}`);
  }
};

export const middleware: Route.MiddlewareFunction[] = [
  redirectOldDocs,
  redirectResources,
];

export async function loader({ request }: LoaderFunctionArgs) {
  removeTrailingSlashes(request);

  let isDevHost = !isProductionHost(request);
  let url = new URL(request.url);

  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  return data({
    host: url.host,
    siteUrl,
    isProductionHost: !isDevHost,
    noIndex:
      isDevHost ||
      url.pathname === "/docs/en/v1/api/remix" ||
      url.pathname === "/docs/en/v1/api/conventions",
  });
}

export function links() {
  let preloadedFonts = [
    "inter-roman-latin-var.woff2",
    "inter-italic-latin-var.woff2",
    "jet-brains-mono.woff2",
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

function ColorSchemeScript() {
  let script = React.useMemo(
    () => `
      let media = window.matchMedia("(prefers-color-scheme: dark)");
      if (media.matches) document.documentElement.classList.add("dark");
    `,
    [],
  );

  useLayoutEffect(() => {
    let media = window.matchMedia("(prefers-color-scheme: dark)");
    let sync = () => {
      document.documentElement.classList.toggle("dark", media.matches);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

interface DocumentProps {
  title?: string;
  forceTheme?: "dark" | "light";
  darkBg?: string;
  noIndex: boolean;
  children: React.ReactNode;
}

function Document({
  children,
  title,
  forceTheme,
  darkBg,
  noIndex,
}: DocumentProps) {
  useLayoutEffect(() => {
    if (forceTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (forceTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [forceTheme]);

  return (
    <html
      lang="en"
      data-theme={forceTheme ?? undefined}
      className={forceTheme === "dark" ? "dark" : undefined}
    >
      <head>
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
        {forceTheme === undefined ? <ColorSchemeScript /> : null}
      </head>

      <body
        className={cx(
          "flex min-h-screen w-full flex-col overflow-x-hidden antialiased selection:bg-blue-200 selection:text-black dark:selection:bg-blue-800 dark:selection:text-white",
          forceTheme === "dark"
            ? [darkBg || "bg-gray-900", "text-gray-200"]
            : forceTheme === "light"
              ? "bg-white text-gray-900"
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
  let { noIndex } = useLoaderData<typeof loader>();
  let matches = useMatches();
  let forceTheme: "dark" | "light" | undefined;
  for (let { handle } of matches) {
    if (handle && typeof handle === "object" && "forceTheme" in handle) {
      let theme = (handle as { forceTheme: unknown }).forceTheme;
      if (theme === "dark" || theme === "light") {
        forceTheme = theme;
      }
    }
  }

  if (process.env.NODE_ENV !== "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFathomClient("IRVDGCHK", {
      url: "https://cdn.usefathom.com/script.js",
      spa: "history",
      excludedDomains: ["localhost"],
    });
  }

  return (
    <Document noIndex={noIndex} forceTheme={forceTheme}>
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
        forceTheme="dark"
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
    <Document noIndex title="Error" forceTheme="dark" darkBg="bg-red-brand">
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
