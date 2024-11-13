import { redirect, type LoaderFunctionArgs } from "react-router";
export async function loader({ params }: LoaderFunctionArgs) {
  const { lang } = params;
  return redirect(`/docs/${lang}/main`);
}
