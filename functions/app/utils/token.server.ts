import { Response } from "@remix-run/data";
import { db } from "./db.server";
import type { Token } from "./db.server";
import { getToken, getTokenMembersSnapshot } from "./tokens.server";

export let requireToken = async (
  paramToken: string
): Promise<FirebaseFirestore.DocumentSnapshot<Token>> => {
  let token = await db.tokens.doc(paramToken).get();

  if (!token.exists) {
    return new Response(JSON.stringify({ code: "invalid_token" }), {
      status: 404,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  let membersSnapshot = await getTokenMembersSnapshot(paramToken);
  if (membersSnapshot.size >= token.data().quantity) {
    return new Response(JSON.stringify({ code: "token_full" }), {
      status: 402,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  return token;
};
