import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { isProductionHost } from "~/lib/http.server";

// TODO: Remove prior to launch as this is only here to render 404s for production
export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  console.log(context);
  if (isProductionHost(request)) {
    throw json({}, { status: 404 });
  }
  return json({});
};
