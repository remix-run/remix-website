import { redirect } from "react-router";
import type { Route } from "./+types/docs.$lang._index";

export async function loader({ params }: Route.LoaderArgs) {
  return redirect(`/docs/${params.lang}/main`);
}
