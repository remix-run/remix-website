import { routes } from "../../routes";
import { getRequestContext } from "../../utils/request-context";

export async function jamHandler() {
  let requestUrl = getRequestContext().request.url;
  let location = new URL(routes.jam2025.href(), requestUrl);
  return Response.redirect(location, 302);
}
