const { getToken } = require("../../utils/tokens");

exports.requireToken = async (paramToken) => {
  let token = await getToken(paramToken);
  if (token === null) {
    return new Response(JSON.stringify({ message: "invalid token" }), {
      status: 404,
      headers: {
        "content-type": "application/json",
      },
    });
  }
  return token;
};
