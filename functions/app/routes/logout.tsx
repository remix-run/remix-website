import * as CacheControl from "../utils/CacheControl";
import redirect from "../utils/redirect";
import type { ActionFunction } from "remix";
import { rootStorage } from "../utils/sessions";

export let action: ActionFunction = async ({ request }) => {
  let session = await rootStorage.getSession(request.headers.get("Cookie"));
  session.unset("token");
  session.set("loggedOut", true);
  return redirect(request, "/login", {
    headers: {
      "Set-Cookie": await rootStorage.commitSession(session),
    },
  });
};

export function headers() {
  return CacheControl.nostore;
}

export default function () {
  return null;
}
