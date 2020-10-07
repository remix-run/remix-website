import React from "react";
import { useLocationPending } from "@remix-run/react";
import { Outlet, NavLink } from "react-router-dom";
import { LoadingLogo } from "../components/Logo";

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
  return (
    <>
      <section id="nav">
        <div id="logo">
          <LoadingLogo />
        </div>
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
      <main className={pending ? "loading" : ""}>
        <Outlet />
      </main>
    </>
  );
}
