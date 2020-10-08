import React from "react";
import { useLocationPending } from "@remix-run/react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LoadingLogo } from "../components/DocsLogo";

export function headers({ loaderHeaders }) {
  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
  };
}

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
  let pending = useLocationPending();
  let location = useLocation();
  let isIndex = location.pathname === "/docs";
  return (
    <>
      <section id="nav" data-is-index={isIndex}>
        <div id="logo">
          <LoadingLogo />
        </div>
        <NavLink to="/docs" id="index-link" activeClassName="hidden" end>
          Home
        </NavLink>
        <nav>
          <ul>
            {sections.map(([name, links], index) => (
              <li key={index}>
                <div className="heading">{name}</div>
                <ul>
                  {links.map(([label, to], index) => (
                    <li key={index}>
                      <NavLink to={to} activeClassName="active">
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      <main data-is-index={isIndex} className={pending ? "loading" : ""}>
        <Outlet />
      </main>
    </>
  );
}
