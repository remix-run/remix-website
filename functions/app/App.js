import React from "react";

import { Meta, Scripts, Styles, Routes } from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <Meta />
        <Styles />
      </head>
      <body>
        <Routes />
        <Scripts />
      </body>
    </html>
  );
}
