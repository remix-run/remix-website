import React from "react";
import { redirect } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";
import { requireSession } from "../../utils/session.server";
import { requireToken } from "../../utils/token.server";
import { addTokenMember } from "../../utils/tokens.server";
import type { Token } from "../../utils/db.server";

let error = (message) => {
  return new Response(JSON.stringify({ message }), {
    status: 500,
    headers: {
      "content-type": "application/json",
    },
  });
};

export let loader: LoaderFunction = async ({ context, request, params }) => {
  let url = new URL(request.url);

  // FIXME: requireToken is being used here like a normal function, not a things
  // that returns responses fix that and we can remove the type casting here
  let token = (await requireToken(
    params.token
  )) as FirebaseFirestore.DocumentSnapshot<Token>;

  let sessionUser = await requireSession(request);
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
