const { Response } = require("@remix-run/loader");
const { requireCustomer } = require("../../utils/session");
const { stripe } = require("../../../utils/stripe");

module.exports = requireCustomer(async ({ url }, { user }) => {
  try {
    let session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: url.origin + "/dashboard",
    });
    return Response.redirect(session.url);
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
  return null;
});
