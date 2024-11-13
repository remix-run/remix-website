import { redirect } from "react-router";

export async function loader() {
  return redirect("/docs/en/main", { status: 301 });
}
