/** @jsxImportSource remix/component */
import { clientEntry } from "remix/component";
import { HydratedHeader } from "./header-client";

export const Header = clientEntry(
  "/app/remix/home/header-client.tsx#HydratedHeader",
  HydratedHeader,
);
