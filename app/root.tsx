import * as React from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useMatches,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import {
  load as loadFathom,
  type LoadOptions as FathomLoadOptions,
} from "fathom-client";
import tailwind from "~/styles/tailwind.css";
import bailwind from "~/styles/bailwind.css";
import {
  removeTrailingSlashes,
  ensureSecure,
  isProductionHost,
} from "~/utils/http.server";
import { ColorSchemeScript, useColorScheme } from "~/utils/color-scheme";
import { parseColorScheme } from "~/utils/color-scheme.server";
import iconsHref from "~/icons.svg";
import { canUseDOM } from "~/utils/misc";
import cx from "clsx";

declare global {
  var __env: {
    NODE_ENV: "development" | "production";
  };
}

export async function loader({ request }: LoaderArgs) {
  ensureSecure(request);
  removeTrailingSlashes(request);
  let env = {
    NODE_ENV: process.env.NODE_ENV,
  };

  let isDevHost = !isProductionHost(request);
  let url = new URL(request.url);

  let colorScheme = await parseColorScheme(request);

  return json(
    {
      colorScheme,
      noIndex:
        isDevHost ||
        url.pathname === "/docs/en/v1/api/remix" ||
        url.pathname === "/docs/en/v1/api/conventions",
      env,
    },
    {
      headers: {
        Vary: "Cookie",
      },
    }
  );
}

export function links() {
  let preloadedFonts = [
    "founders-grotesk-bold.woff2",
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
    { rel: "stylesheet", href: tailwind },
    { rel: "stylesheet", href: bailwind },
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
  return (
    <html
      lang="en"
      className={forceDark || colorScheme === "dark" ? "dark" : undefined}
      data-theme={forceDark ? "dark" : colorScheme}
    >
      <head>
        <ColorSchemeScript forceConsistentTheme={forceDark} />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#121212" />
        {noIndex && <meta name="robots" content="noindex" />}
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <Links />
        <Meta />
        {title && <title data-title-override="">{title}</title>}
      </head>

      <body
        className={cx(
          "min-h-screen flex flex-col w-full overflow-x-hidden",
          forceDark
            ? [darkBg || "bg-gray-900", "text-gray-200"]
            : "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-200"
        )}
      >
        {children}
        <ScrollRestoration />
        <Scripts />
        {isDev ? <LiveReload /> : null}
      </body>
    </html>
  );
}

export default function App() {
  let matches = useMatches();
  let { noIndex, env } = useLoaderData<typeof loader>();
  let forceDark = matches.some((match) => match.handle?.forceDark);

  if (env.NODE_ENV !== "development") {
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
      isDev={env.NODE_ENV === "development"}
    >
      <Outlet />
      <img
        src={iconsHref}
        alt=""
        hidden
        // this img tag simply forces the icons to be loaded at a higher
        // priority than the scripts (chrome only for now)
        // @ts-expect-error
        fetchpriority="high"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__env = ${JSON.stringify(env)};`,
        }}
      />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  if (!canUseDOM) {
    console.error(error);
  }
  return (
    <Document noIndex title="Error" forceDark darkBg="bg-red-brand">
      <div className="flex flex-col justify-center flex-1 text-white">
        <div className="leading-none text-center">
          <h1 className="text-[25vw]">Error</h1>
          <div className="text-3xl">
            Something went wrong! Please try again later.
          </div>
        </div>
      </div>
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();
  return (
    <Document
      noIndex
      title={caught.statusText}
      forceDark
      darkBg="bg-blue-brand"
    >
      <div className="flex flex-col justify-center flex-1 text-white">
        <div className="leading-none text-center">
          <h1 className="font-mono text-[25vw]">{caught.status}</h1>
          <a
            className="inline-block text-[8vw] underline"
            href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${caught.status}`}
          >
            {caught.statusText}
          </a>
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
