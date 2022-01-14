import { ActionFunction, json } from "remix";
import { subscribeToNewsletter } from "~/utils/convertkit";
import { requirePost } from "~/utils/http.server";

export let action: ActionFunction = async ({ request }) => {
  requirePost(request);

  let body = new URLSearchParams(await request.text());
  let email = body.get("email");
  if (typeof email !== "string" || email.indexOf("@") === -1) {
    return json({ error: "Invalid Email" }, { status: 400 });
  }

  try {
    await subscribeToNewsletter(email);
  } catch (e: any) {
    return json({ error: e.message || "Unknown error" });
  }

  return json({ ok: true });
};
