import { Meta, Links, useCatch, useMatches, Outlet } from "remix";
import type { LoaderFunction } from "remix";

import tailwind from "~/styles/tailwind.css";
import bailwind from "~/styles/bailwind.css";
import { Body } from "~/components/body";
import { useScrollRestoration } from "~/components/scroll-restoration";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { removeTrailingSlashes } from "~/utils/http";

export let loader: LoaderFunction = async ({ request }) => {
  await removeTrailingSlashes(request);
  return null;
};

export let unstable_shouldReload = () => false;

export function links() {
  return [
    { rel: "preload", as: "font", href: "/font/founders-grotesk-bold.woff2" },
    { rel: "stylesheet", href: tailwind },
    { rel: "stylesheet", href: bailwind },
  ];
}

function Document({
  children,
  title,
  forceDark,
  darkBg,
}: {
  children: React.ReactNode;
  title?: string;
  forceDark?: boolean;
  darkBg?: string;
}) {
  useScrollRestoration();
  return (
    <html lang="en">
      <head>
        {title && <title>{title}</title>}
        <meta charSet="utf-8" />
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
        <Meta />
        <Links />
      </head>

      <Body forceDark={forceDark} darkBg={darkBg}>
        <div className="flex-1 flex flex-col h-full">
          <Header forceDark={forceDark} />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer forceDark={forceDark} />
        </div>
      </Body>
    </html>
  );
}

export default function App() {
  let matches = useMatches();
  let forceDark = matches.some((match) => match.handle?.forceDark);
  return (
    <Document forceDark={forceDark}>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Error" forceDark darkBg="bg-red-brand">
      <div className="flex-1 flex flex-col justify-center text-white">
        <div className="text-center leading-none">
          <h1 className="text-[25vw]">Error</h1>
          <div className="text-xl">{error.message}</div>
          <div className="h-[10vh]" />
        </div>
      </div>
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();
  return (
    <Document title={caught.statusText} forceDark darkBg="bg-blue-brand">
      <div className="flex-1 flex flex-col justify-center text-white">
        <div className="text-center leading-none">
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
