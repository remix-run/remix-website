import React from "react";
import { useRouteData } from "remix";
import { redirect } from "remix";
import type { LoaderFunction } from "remix";
import { requireCustomer } from "../../utils/session.server";
import { stripe } from "../../utils/stripe.server";

export let loader: LoaderFunction = ({ request }) => {
  return requireCustomer(request)(async ({ user }) => {
    try {
      let session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: "https://remix.run/dashboard",
      });
      return redirect(session.url);
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
  });
};

export default function Billing() {
  let error = useRouteData();
  return (
    <div className="mt-10 max-w-2xl mx-auto rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="focus:outline-none text-sm leading-5 font-medium text-red-800">
            Could not create billing session.
          </h3>
          <div className="mx-2 mt-2 text-sm leading-5 text-red-700 italic">
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
