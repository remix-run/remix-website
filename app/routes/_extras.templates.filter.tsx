import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;

  if (searchParams.size < 1) {
    return redirect("/templates");
  }

  return {};
}

export default function FilteredTemplates() {
  return <h1>Eventually a filtered template page will be here</h1>;
}
