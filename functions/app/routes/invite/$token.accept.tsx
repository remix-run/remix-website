import React from "react";
import { redirect } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";
import { error } from "../../utils/response.server";
import { requireSession } from "../../utils/session.server";
import { requireToken } from "../../utils/token.server";
import { addTokenMember } from "../../utils/tokens.server";

export let loader: LoaderFunction = async ({ context, request, params }) => {
  let url = new URL(request.url);
  let token = await requireToken(params.token);
  let sessionUser = await requireSession({ context, url });
  try {
    await addTokenMember(token, sessionUser);
  } catch (err) {
    console.error(err);
    return error("Could not add member to token");
  }
  return redirect("/dashboard");
};

export default function Invite() {
  return (
    <div>
      <h1>How did you get here?</h1>
    </div>
  );
}
