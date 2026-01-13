import { data } from "react-router";
import { subscribeToNewsletter } from "~/lib/convertkit";
import { requirePost } from "~/lib/http.server";
import type { Route } from "./+types/newsletter-subscribe";

export async function action({ request }: Route.ActionArgs) {
  requirePost(request);

  let body = new URLSearchParams(await request.text());
  let email = body.get("email");
  if (typeof email !== "string" || email.indexOf("@") === -1) {
    return data({ error: "Invalid Email", ok: false }, { status: 400 });
  }

  let tags = body.getAll("tag").map((tag) => parseInt(tag));

  if (tags.some((tag) => isNaN(tag))) {
    return data({ error: "Invalid Tag", ok: false }, { status: 400 });
  }

  try {
    await subscribeToNewsletter(email, tags);
  } catch (e: any) {
    return { error: e.message || "Something went wrong", ok: false };
  }

  return { error: null, ok: true };
}
