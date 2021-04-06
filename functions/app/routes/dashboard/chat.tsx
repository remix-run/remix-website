import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = () => {
  return redirect("https://discord.gg/VBePs6d");
};

export default function Chat() {
  return null;
}
