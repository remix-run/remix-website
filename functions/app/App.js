import React from "react";

import { Meta, Scripts, Styles, Routes } from "@remix-run/react";
import { useLocation } from "react-router-dom";

export default function App() {
  let location = useLocation();

  let locations = React.useRef();
  if (!locations.current) {
    locations.current = new Set();
    locations.current.add(location.key);
  }

  React.useEffect(() => {
    let wasWeirdHistoryBug = location.key === "default";
    if (wasWeirdHistoryBug || locations.current.has(location.key)) return;
    locations.current.add(location.key);
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [location]);

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
        {/* TODO: GET HIS OUT OF HERE! */}
        <link
          href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
          rel="stylesheet"
        />
        <Styles />
      </head>
      <body>
        <Routes />
        <Scripts />
      </body>
    </html>
  );
}
