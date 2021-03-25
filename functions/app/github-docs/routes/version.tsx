import { useRef } from "react";
import { Link, Outlet, useNavigate, NavLink } from "react-router-dom";
import { useMatches, usePendingLocation, useRouteData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/data";
import { json } from "@remix-run/data";
import docsStyles from "url:../styles/docs.css";
import docsTypography from "url:../styles/typography.css";

import type { MenuDir, VersionHead } from "../utils.server";
import {
  addTrailingSlash,
  getVersion,
  getMenu,
  getVersions,
  getCacheControl,
} from "../utils.server";

import { useElementScrollRestoration } from "../scroll-restoration";
import { useDelegatedReactRouterLinks } from "../delegate-links";
import NavSpinner from "../spinner";
import Breadcrumbs from "../breadcrumbs";

////////////////////////////////////////////////////////////////////////////////
interface LoaderData {
  menu: MenuDir;
  version: VersionHead;
  versions: VersionHead[];
}

let baseUrl = "/dashboard/docs";

export let loader: LoaderFunction = async ({ context, request, params }) => {
  return addTrailingSlash(request)(async () => {
    let versions = await getVersions(context.docs);
    let version = getVersion(params.version, versions);
    if (!version) {
      return json({ notFound: true }, { status: 404 });
    }

    try {
      let menu = await getMenu(context.docs, version);
      let data: LoaderData = { menu, version, versions };
      return json(data, {
        headers: { "Cache-Control": getCacheControl(request.url) },
      });
    } catch (error) {
      throw error;
      return json({ notFound: true }, { status: 404 });
    }
  });
};

////////////////////////////////////////////////////////////////////////////////
export let links = () => {
  return [
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    { rel: "preconnect", href: "https://unpkg.com" },
    {
      rel: "stylesheet",
      href:
        "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=fallback",
    },
    {
      rel: "stylesheet",
      href:
        "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,400;0,600;1,400;1,600&display=fallback",
    },
    {
      rel: "stylesheet",
      href: "https://unpkg.com/modern-css-reset@1.4.0/dist/reset.min.css",
    },
    { rel: "stylesheet", href: docsStyles },
    { rel: "stylesheet", href: docsTypography },
  ];
};

export let handle = {
  crumb: (
    { data: { version } }: { data: { version: VersionHead } },
    ref: any
  ) => {
    return (
      <Link ref={ref} to={`${baseUrl}${version.head}`}>
        {version.head} ({version.version})
      </Link>
    );
  },
};

export default function Docs() {
  let outletRef = useRef<HTMLDivElement | null>(null);
  let data = useRouteData<LoaderData>();
  let matches = useMatches();
  useElementScrollRestoration(outletRef);
  useDelegatedReactRouterLinks();

  let is404 = matches.some((match: any) => match.data && match.data.notFound);
  if (is404) return <NotFound />;

  return (
    <>
      <div ref={outletRef} data-docs-page-wrapper>
        <Breadcrumbs />
        <Outlet />
      </div>
      <div data-docs-menu-wrapper>
        <NavSpinner />
        <Link to="/" aria-label="Remix">
          <picture style={{ maxWidth: "300px" }}>
            <source
              srcSet="/img/remix-on-dark-compressed.webp"
              media="(prefers-color-scheme: dark)"
              type="image/webp"
            />
            <source
              srcSet="/img/remix-on-light-compressed.webp"
              media="(prefers-color-scheme: light)"
              type="image/webp"
            />
            <source
              srcSet="/img/remix-on-dark-compressed.png"
              media="(prefers-color-scheme: dark)"
              type="image/webp"
            />
            <source
              srcSet="/img/remix-on-light-compressed.png"
              media="(prefers-color-scheme: light)"
              type="image/webp"
            />
            <img src="/img/remix-on-light.png" />
          </picture>
        </Link>

        <div style={{ marginTop: "2rem" }} />

        <Menu data={data} />
      </div>
    </>
  );
}

export function Menu({ data }: { data: LoaderData }) {
  let navigate = useNavigate();
  return (
    <nav aria-label="Site">
      <div data-docs-version-wrapper>
        <select
          data-docs-version-select
          defaultValue={data.version.head}
          onChange={(event) => {
            navigate(`${baseUrl}/${event.target.value}/`);
          }}
        >
          {data.versions.map((v) => (
            <option key={v.head} value={v.head}>
              {v.head} ({v.version})
            </option>
          ))}
        </select>
      </div>
      <MenuList level={1} dir={data.menu} />
    </nav>
  );
}

export function MenuList({ dir, level = 1 }: { dir: MenuDir; level?: number }) {
  return (
    <ul data-docs-menu data-level={level}>
      {dir.dirs &&
        dir.dirs.map((dir, index) => (
          <li data-docs-dir data-level={level} key={index}>
            {dir.hasIndex ? (
              <NavLink data-docs-link to={baseUrl + dir.path + "/"}>
                {dir.title}
              </NavLink>
            ) : (
              <span data-docs-label>{dir.title}</span>
            )}
            <MenuList level={level + 1} dir={dir} />
          </li>
        ))}
      {dir.files.map((file, index) => (
        <li data-docs-file key={index}>
          <NavLink data-docs-link to={baseUrl + file.path + "/"}>
            {file.title}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function NotFound() {
  return (
    <div data-docs-not-found>
      <h1>Not Found</h1>
    </div>
  );
}
