import { redirect } from "remix";
import type { LoaderFunction } from "remix";

export let loader: LoaderFunction = () => {
  return redirect("https://discord.gg/VBePs6d");
};

export default function Chat() {
  return null;
}
