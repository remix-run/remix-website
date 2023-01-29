import type { ActionArgs } from "@remix-run/node";
import {
  serializeColorScheme,
  validateColorScheme,
} from "~/utils/color-scheme.server";
import { safeRedirect } from "~/utils/http.server";

export async function action({ request }: ActionArgs) {
  let formData = await request.formData();
  let colorScheme = formData.get("colorScheme");
  if (!validateColorScheme(colorScheme)) {
    throw new Response("Bad Request", { status: 400 });
  }

  return safeRedirect(formData.get("returnTo"), {
    headers: { "Set-Cookie": await serializeColorScheme(colorScheme) },
  });
}
