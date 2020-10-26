const { Response } = require("@remix-run/loader");
const { getCustomer } = require("../../utils/session");
const { addToDiscussRepo } = require("../../../utils/github");

module.exports = async ({ context: { req } }) => {
  let { sessionUser, user } = await getCustomer(req);
  try {
    if (!user.githubLogin) {
      // TODO: gonna need to prompt for this when we have different logins
      let githubId = sessionUser.firebase.identities["github.com"][0];
      await addToDiscussRepo(sessionUser.uid, githubId);
    }
    return Response.redirect("https://github.com/remix-run/discuss");
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: error.message || "Unknown error" }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
};
