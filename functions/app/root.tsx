import React, { useRef } from "react";
import {
  Meta,
  Scripts,
  Links,
  useRouteData,
  useMatches,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/data";
import { json } from "@remix-run/data";
import { useLocation, Outlet } from "react-router-dom";
import { useWindowScrollRestoration } from "./components/scroll";

import { config } from "./utils/firebase.server";

export let loader: LoaderFunction = () => {
  let firebaseConfigProduction = {
    apiKey: "AIzaSyC2gSRi56WPco1HkjkycB4_8pXX2k6_zBg",
    authDomain: "remix-run.firebaseapp.com",
    databaseURL: "https://remix-run.firebaseio.com",
    projectId: "remix-run",
    storageBucket: "remix-run.appspot.com",
    messagingSenderId: "699838971986",
    appId: "1:699838971986:web:54f24ac69da76d82349f8b",
    measurementId: "G-WVPGQTDNK2",
  };

  let firebaseConfigStaging = {
    apiKey: "AIzaSyBbeX1z4Z645pzqqTx5k2PVLPI4oGa8GA4",
    authDomain: "playground-a6490.firebaseapp.com",
    databaseURL: "https://playground-a6490.firebaseio.com",
    projectId: "playground-a6490",
    storageBucket: "playground-a6490.appspot.com",
    messagingSenderId: "570373624547",
    appId: "1:570373624547:web:e99465a877aa47e90dabd6",
  };

  return json(
    {
      env: {
        firebase:
          config.app.env === "production"
            ? firebaseConfigProduction
            : firebaseConfigStaging,
        stripe: config.stripe.public_key,
      },
    },
    { headers: { "Cache-Control": "public, max-age=0" } }
  );
};

let noScriptPaths = new Set(["/", "/logout", "/features", "/privacy", "/logo"]);

function shouldIncludeScripts(pathname) {
  if (noScriptPaths.has(pathname)) {
    return false;
  }
  return true;
}

export default function App() {
  let { env } = useRouteData();
  let location = useLocation();
  let includeScripts = shouldIncludeScripts(location.pathname);
  let matches = useMatches();
  // useWindowScrollRestoration();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" href="/favicon-96.png" sizes="96x96" />
        <link rel="icon" href="/favicon-228.png" sizes="228x228" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white text-gray-900">
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)};`,
          }}
        />
        {includeScripts && <Scripts />}
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }) {
  console.error(error);
  return <div>Error! {error.message}</div>;
}
