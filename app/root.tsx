import * as React from "react";

import {
  Meta,
  Links,
  useCatch,
  useMatches,
  Outlet,
  useLoaderData,
} from "remix";
import type { LoaderFunction } from "remix";

import tailwind from "~/styles/tailwind.css";
import bailwind from "~/styles/bailwind.css";
import { Body } from "~/components/body";
import {
  removeTrailingSlashes,
  ensureSecure,
  isProductionHost,
} from "~/utils/http";

export let loader: LoaderFunction = async ({ request }) => {
  await ensureSecure(request);
  await removeTrailingSlashes(request);
  return { noIndex: !isProductionHost(request) };
};

export let unstable_shouldReload = () => false;

export function links() {
  return [
    {
      rel: "preload",
      as: "font",
      href: "/font/founders-grotesk-bold.woff2",
      crossOrigin: "anonymous",
    },
    { rel: "stylesheet", href: tailwind },
    { rel: "stylesheet", href: bailwind },
  ];
}

interface DocumentProps {
  title?: string;
  forceDark?: boolean;
  darkBg?: string;
  noIndex: boolean;
}

const Document: React.FC<DocumentProps> = ({
  children,
  title,
  forceDark,
  darkBg,
  noIndex,
}) => {
  return (
    <html lang="en">
      <head>
        {title && <title>{title}</title>}
        <meta charSet="utf-8" />
        {noIndex && <meta name="robots" content="noindex" />}
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <link
          rel="icon"
          href="/favicon-light.1.png"
          type="image/png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-dark.1.png"
          type="image/png"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Source+Code+Pro:wght@400;600&display=auto"
          rel="stylesheet"
        />

        <Meta />
        <Links />
      </head>

      <Body forceDark={forceDark} darkBg={darkBg}>
        {children}
      </Body>
    </html>
  );
};

export default function App() {
  let matches = useMatches();
  let forceDark = matches.some((match) => match.handle?.forceDark);
  let { noIndex } = useLoaderData();

  return (
    <Document noIndex={noIndex} forceDark={forceDark}>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document noIndex title="Error" forceDark darkBg="bg-red-brand">
      <div className="flex flex-col justify-center flex-1 text-white">
        <div className="leading-none text-center">
          <h1 className="text-[25vw]">Error</h1>
          <div className="text-d-h3">{error.message}</div>
          <div className="h-[10vh]" />
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
          <div className="h-[10vh]" />
        </div>
      </div>
    </Document>
  );
}
