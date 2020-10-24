const { Response } = require("@remix-run/loader");
const { getToken, getTokenMembersSnapshot } = require("../../utils/tokens");

exports.requireToken = async (paramToken) => {
  let token = await getToken(paramToken);
  if (token === null) {
    return new Response(JSON.stringify({ code: "invalid_token" }), {
      status: 404,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  let membersSnapshot = await getTokenMembersSnapshot(token.id);
  if (membersSnapshot.size === token.quantity) {
    return new Response(JSON.stringify({ code: "token_full" }), {
      status: 402,
      headers: {
        "content-type": "application/json",
      },
    });
  }
  return token;
};
