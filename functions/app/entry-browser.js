import React from "react";
import { hydrate } from "react-dom";
import Remix from "@remix-run/react/browser";

import App from "./App";

window.history.scrollRestoration = "manual";

hydrate(
  <Remix>
    <App />
  </Remix>,
  document
);
