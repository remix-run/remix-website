import * as React from "react";
import { useLoaderData, useMatches, useParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import type {
  HeadersFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { CACHE_CONTROL } from "~/lib/http.server";
import invariant from "tiny-invariant";
import type { Doc } from "~/lib/gh-docs";
import { getRepoDoc } from "~/lib/gh-docs";
import iconsHref from "~/icons.svg";
import cx from "clsx";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-links";
import type { loader as docsLayoutLoader } from "~/routes/docs/$lang.$ref";

export async function loader({ params, request }: LoaderArgs) {
  let url = new URL(request.url);
  let pageUrl = url.protocol + "//" + url.host + url.pathname;
  invariant(params.ref, "expected `ref` params");
  let doc = await getRepoDoc(params.ref, params["*"] || "index");
  if (!doc) {
    throw new Response("", { status: 404 });
  }
  return json(
    { doc, pageUrl },
    { headers: { "Cache-Control": CACHE_CONTROL.doc } }
  );
}

export let headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.doc,
    Vary: "Cookie",
  };
};

const LAYOUT_LOADER_KEY = "routes/docs/$lang.$ref";

export let meta: MetaFunction<
  typeof loader,
  { [LAYOUT_LOADER_KEY]: typeof docsLayoutLoader }
> = ({ data, parentsData }) => {
  if (!data) return { title: "Not Found" };
  let parentData = parentsData[LAYOUT_LOADER_KEY];
  if (!parentData) return {};

  let rootData = parentsData["root"];
  let { doc } = data;
  let { latestVersion, releaseBranch, branches, currentGitHubRef } = parentData;

  let titleAppend =
    currentGitHubRef === releaseBranch || currentGitHubRef === latestVersion
      ? ""
      : branches.includes(currentGitHubRef)
      ? ` (${currentGitHubRef} branch)`
      : currentGitHubRef.startsWith("v")
      ? ` (${currentGitHubRef})`
      : ` (v${currentGitHubRef})`;

  let title = doc.attrs.title + titleAppend;

  // seo: only want to index the main branch
  let isMainBranch = currentGitHubRef === releaseBranch;

  let robots =
    rootData.isProductionHost && isMainBranch
      ? "index,follow"
      : "noindex,nofollow";

  let pageUrl = data.pageUrl;

  // TODO: add more + better SEO stuff
  // let url = new URL(data.pageUrl);
  // let siteUrl = url.protocol + "//" + url.host;
  // let ogImage = `${siteUrl}/image.jpg`;
  // let ogImageAlt = title;
  // let twitterImage = ogImage;
  // let twitterImageAlt = title;
  // let description: 'some description';

  return {
    title: `${title} | Remix`,
    // description,

    "og:title": title,
    // "og:description": description,
    "og:url": pageUrl,
    "og:type": "article",
    "og:site_name": "Remix",
    // "og:image": ogImage,
    // "og:image:alt": ogImageAlt,
    // "og:image:secure_url": ogImage,
    // "og:image:type": "image/jpeg",
    // "og:image:width": "1200",
    // "og:image:height": "630",
    // "og:locale": "en_US",

    "twitter:title": title,
    "twitter:site": "@remix_run",
    "twitter:creator": "@remix_run",
    // "twitter:image": twitterImage,
    // "twitter:image:alt": twitterImageAlt,
    // "twitter:description": description,
    // "twitter:card": "summary",

    robots: robots,
    googlebot: robots,
  };
};

export default function DocPage() {
  let { doc } = useLoaderData<typeof loader>();
  let ref = React.useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(ref);
  let matches = useMatches();
  let isDocsIndex = matches.some((match) =>
    match.id.endsWith("$lang.$ref/index")
  );

  return (
    <div className="xl:flex xl:w-full xl:gap-8">
      {isDocsIndex ? null : doc.headings.length > 3 ? (
        <>
          <SmallOnThisPage doc={doc} />
          <LargeOnThisPage doc={doc} />
        </>
      ) : (
        <div className="hidden xl:order-1 xl:block xl:w-56 xl:flex-shrink-0" />
      )}
      <div className="min-w-0 pt-8 pb-4 xl:flex-grow">
        <div ref={ref} className="markdown w-full pb-[33vh]">
          <div
            className="md-prose"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        </div>
      </div>
    </div>
  );
}

function LargeOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <div className="hidden xl:block sticky top-28 order-1 mt-10 pb-4 max-h-[calc(100vh-10rem)] w-56 flex-shrink-0 self-start overflow-y-auto">
      <nav className="mb-2 flex items-center pb-1 pt-0 text-[1rem] font-bold tracking-wide">
        On this page
      </nav>
      <ul className="md-toc flex flex-col flex-wrap gap-2 leading-[1.125]">
        {doc.headings.map((heading, i) => {
          return (
            <li key={i}>
              <a
                href={`#${heading.slug}`}
                dangerouslySetInnerHTML={{ __html: heading.html || "" }}
                className={cx(
                  "group relative my-1 rounded-md border-transparent pb-1 text-sm",
                  "text-gray-700 hover:text-blue-500 dark:text-gray-400",
                  "transition-colors duration-150 ease-in-out"
                )}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SmallOnThisPage({ doc }: { doc: SerializeFrom<Doc> }) {
  return (
    <details className="group -mx-4 flex h-full flex-col sm:-mx-6 lg:mx-0 lg:mt-4 xl:ml-80 xl:hidden">
      <summary className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700">
        <div className="flex items-center gap-2">
          <svg aria-hidden className="h-5 w-5 group-open:hidden">
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
          <svg aria-hidden className="hidden h-5 w-5 group-open:block">
            <use href={`${iconsHref}#chevron-d`} />
          </svg>
        </div>
        <div className="whitespace-nowrap">On this page</div>
      </summary>
      <ul className="pl-9">
        {doc.headings.map((heading, i) => (
          <li key={i}>
            <a
              href={`#${heading.slug}`}
              dangerouslySetInnerHTML={{ __html: heading.html || "" }}
              className="block py-2 text-sm text-gray-400 hover:text-gray-900 active:text-red-brand dark:text-gray-400 dark:hover:text-gray-50 dark:active:text-red-brand"
            />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function CatchBoundary() {
  let params = useParams();
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <h1 className="text-9xl font-bold">404</h1>
      <p className="text-lg">
        There is no doc for <i className="text-gray-500">{params["*"]}</i>
      </p>
    </div>
  );
}
