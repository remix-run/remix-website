import React from "react";
import { useLocationPending } from "@remix-run/react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

let sections = [
  [
    "Quickstart Tutorial",
    [
      ["Installation", "tutorial/installation"],
      ["Defining Routes", "tutorial/defining-routes"],
      ["Loading Data", "tutorial/loading-data"],
      ["Nested Routes & Params", "tutorial/nested-routes-params"],
      ["Styling", "tutorial/styling"],
      ["Deploying", "tutorial/deploying"],
    ],
  ],
  [
    "API",
    [
      ["@remix-run/express", "express"],
      ["@remix-run/firebase", "firebase"],
      ["@remix-run/react", "react"],
      ["@remix-run/loader", "loader"],
    ],
  ],
  [
    "Guides",
    [
      ["Data Loading", "data"],
      ["Deploying", "deploying"],
      ["HTTP Caching", "caching"],
      ["Not Found Handling", "not-found"],
      ["Routing", "routing"],
      ["What about SSG?", "ssg"],
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
    <div>
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
            md:w-64 md:fixed md:top-0 md:bottom-0 md:pt-20 md:px-6
        `}
      >
        <ul>
          {sections.map(([name, links], index) => (
            <li key={index}>
              <div
                className="
                    uppercase font-medium tracking-tight text-blue-900 pb-1 mt-4
                    md:text-xs md:mt-8
                  "
              >
                {name}
              </div>
              <ul>
                {links.map(([label, to], index) => (
                  <li
                    className="
                        border-b border-blue-100 last:border-b-0 
                        md:border-none"
                    key={index}
                  >
                    <NavLink
                      className="
                          block py-2 text-lg text-blue-400 hover:text-blue-700
                          md:text-sm md:py-1
                        "
                      to={to}
                      activeClassName="active"
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
      <main className="md:ml-64 md:mr-52 md:max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
