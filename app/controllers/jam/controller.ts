import { routes } from "../../routes";
import { getRequestContext } from "../../utils/request-context";

export async function jamHandler() {
  let requestUrl = getRequestContext().request.url;
  let location = new URL(routes.jam.y2025.index.href(), requestUrl);
  return Response.redirect(location, 302);
}
