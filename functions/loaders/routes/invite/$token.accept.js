const { Response } = require("@remix-run/loader");
const { error } = require("../../utils/response");
const { requireSession } = require("../../utils/session");
const { requireToken } = require("../../utils/token");
const { addTokenMember } = require("../../../utils/tokens");

module.exports = async ({ context, url, params }) => {
  let token = await requireToken(params.token);
  let sessionUser = await requireSession({ context, url });
  try {
    await addTokenMember(token, sessionUser);
  } catch (err) {
    console.error(err);
    return error("Could not add member to token");
  }
  return Response.redirect("/dashboard");
};
