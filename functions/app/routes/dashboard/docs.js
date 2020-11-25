import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

const VERSION = "0.8.x";

export function headers() {
  return {
    "cache-control": "max-age=600",
  };
}

let sections = [
  [
    "Development",
    [
      ["Releases", "releases", { new: true }],
      ["Roadmap", "roadmap", { disabled: true }],
    ],
  ],
  [
    "Quickstart Tutorial",
    [
      ["Installation", "tutorial/installation"],
      ["Defining Routes", "tutorial/defining-routes"],
      ["Loading Data", "tutorial/loading-data"],
      ["Nested Routes & Params", "tutorial/nested-routes-params"],
      ["Styling", "tutorial/styling"],
      ["Data Mutations", "tutorial/mutations"],
      ["Deploying", "tutorial/deploying"],
    ],
  ],
  [
    "API",
    [
      ["Remix Config", "config"],
      ["Conventions", "conventions"],
      ["Route Module", "route-module"],
      ["Web Fetch API", "fetch"],
      ["@remix-run/react", "react"],
      ["@remix-run/data", "data"],
      ["React Router v6", "react-router"],
    ],
  ],
  [
    "Guides",
    [
      ["CDN Caching", "cdn-caching", { disabled: true }],
      ["Disabling JavaScript", "disabling-javascript"],
      ["Error Handling", "error-handling", { disabled: true }],
      ["Data Mutations", "mutations", { new: true }],
      ["MDX", "mdx"],
      ["Not Found Handling", "not-found", { disabled: true }],
      ["PostCSS", "postcss"],
      ["Redirects", "redirects", { disabled: true }],
      ["Sessions", "sessions", { new: true }],
      ["Routing", "routing"],
    ],
  ],
  [
    "Deploying",
    [
      ["Architect", "deploy/architect", { disabled: true }],
      ["Azure", "deploy/azure", { disabled: true }],
      ["Express", "deploy/express", { disabled: true }],
      ["Firebase", "deploy/firebase", { disabled: true }],
      ["Netlify", "deploy/netlify", { disabled: true }],
      ["Vercel", "deploy/vercel", { disabled: true }],
    ],
  ],
];

export default function Docs() {
  let location = useLocation();
  // TODO: React Router way to know this? useMatch(".", { end: true })
  let isIndex = location.pathname === "/dashboard/docs";
  let [showNav, setShowNav] = React.useState(false);
  let hideNav = !isIndex && !showNav;

  React.useEffect(() => {
    if (showNav) {
      setShowNav(false);
    }
  }, [location]);

  return (
    <div className="dark:bg-gray-900 dark:text-gray-200">
      <button
        onClick={() => setShowNav(!showNav)}
        className={`
          md:hidden
          ${isIndex ? "hidden" : ""}
          flex w-full items-center px-2 py-2
          bg-blue-500 text-blue-100
          hover:bg-blue-600 active:bg-blue-400
        `}
      >
        <svg
          className="h-6 w-6 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={showNav ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}
          />
        </svg>{" "}
        Docs Menu
      </button>
      <nav
        className={`
            ${hideNav ? "hidden md:block" : "md:block"}
            bg-blue-50 pl-4 pt-5 pb-2
            dark:bg-aqua-950
            md:w-64 md:fixed md:overflow-auto md:top-0 md:bottom-0 md:pt-20 md:px-6
        `}
      >
        <div className="font-bold text-xs">v{VERSION}</div>
        <ul>
          {sections.map(([name, links], index) => (
            <li key={index}>
              <div
                className="
                    uppercase font-medium tracking-tight pb-1 mt-4
                    text-blue-900 dark:text-aqua-100
                    md:text-xs md:mt-8
                  "
              >
                {name}
              </div>
              <ul>
                {links.map(([label, to, props = {}], index) => (
                  <li
                    className="
                        border-b border-blue-100 last:border-b-0 
                        md:border-none"
                    key={index}
                  >
                    {props.disabled ? (
                      <div
                        className="
                          block py-2 text-lg
                          text-blue-300
                          dark:text-aqua-800
                          md:text-sm md:py-1
                        "
                      >
                        {label} 🚧
                      </div>
                    ) : (
                      <NavLink
                        className="
                          block py-2 text-lg
                          text-blue-400 hover:text-blue-700
                          dark:text-aqua-700 dark:hover:text-aqua-600
                          md:text-sm md:py-1
                        "
                        to={to}
                        activeClassName="nav-active"
                      >
                        {label} {props.new && "🆕"}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
      <main className="md:ml-64 md:flex">
        <Outlet />
      </main>
    </div>
  );
}
