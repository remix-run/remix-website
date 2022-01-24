import type { LoaderFunction } from "remix";
import { redirect } from "remix";

export const loader: LoaderFunction = () => redirect("/conf/schedule/may-25");
