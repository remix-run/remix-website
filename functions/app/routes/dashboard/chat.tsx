import { redirect } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";

export let loader: LoaderFunction = () => {
  return redirect("https://discord.gg/VBePs6d");
};

export default function Chat() {
  return null;
}
