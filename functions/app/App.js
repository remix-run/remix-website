import React from "react";

import { Meta, Scripts, Styles, Routes } from "@remix-run/react";
import { useLocation } from "react-router-dom";

export default function App() {
  let location = useLocation();

  console.log(location.key, location.hash);

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
        <Meta />
        <link
          rel="stylesheet"
          href="https://unpkg.com/github-markdown-css@4.0.0/github-markdown.css"
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
