import React from "react";
import type { LoaderFunction } from "@remix-run/react";
import { useRouteData } from "@remix-run/react";
import { Response, redirect } from "@remix-run/data";
import { getCustomer } from "../../utils/session.server";
import { addToDiscussRepo } from "../../utils/github.server";

export let loader: LoaderFunction = async ({ context: { req } }) => {
  let { sessionUser, user } = await getCustomer(req);
  try {
    if (!user.githubLogin) {
      // TODO: gonna need to prompt for this when we have different logins
      let githubId = sessionUser.firebase.identities["github.com"][0];
      await addToDiscussRepo(sessionUser.uid, githubId);
    }
    return redirect("https://github.com/remix-run/discuss");
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

export default function Discuss() {
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
            Could not add you to the GitHub repo, please email us:
            hello@remix.run
          </h3>
          <div className="mx-2 mt-2 text-sm leading-5 text-red-700 italic">
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
