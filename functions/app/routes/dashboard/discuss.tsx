import React, { useEffect, useState } from "react";
import type { ActionFunction } from "@remix-run/react";
import { useSubmit } from "@remix-run/react";
import redirectInternally from "../../utils/redirect";
import { redirect } from "@remix-run/data";
import { requireCustomer } from "../../utils/session.server";
import { addToRepo } from "../../utils/github.server";
import LoadingButton, { styles } from "../../components/LoadingButton";
import type { LoadingButtonProps } from "../../components/LoadingButton";
import {
  BeatSpinner,
  IconCheck,
  IconError,
  IconGitHub,
} from "../../components/icons";
import {
  getClientsideUser,
  getIdToken,
  linkGitHubAccount,
} from "../../utils/firebase.client";
import { createUserSession } from "../../utils/sessions";

export let action: ActionFunction = async ({ request }) => {
  return requireCustomer(request)(async ({ sessionUser, user }) => {
    let repo = "https://github.com/remix-run/discuss";

    // already associated their account
    if (user.githubLogin) {
      return redirect(repo);
    }

    // they logged in with GitHub, but we haven't invited them yet
    let ghIdentity = sessionUser.firebase.identities["github.com"];
    let githubId = ghIdentity ? ghIdentity[0] : null;
    if (githubId) {
      await addToRepo(sessionUser.uid, githubId);
      return redirect(repo);
    }

    // linking for the first time from our submit() in the component
    let formParams = new URLSearchParams(await request.text());
    if (formParams.has("githubId") && formParams.has("idToken")) {
      await addToRepo(sessionUser.uid, formParams.get("githubId"));
      // create a new session with this new information
      await createUserSession(request, formParams.get("idToken"));
      return redirect(repo);
    }

    // haven't linked anything yet, show the component
    return redirectInternally(request, "/dashboard/discuss");
  });
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function Repo() {
  let [state, setState] = useState<LoadingButtonProps["state"]>("idle");
  let [error, setError] = useState<string>();
  let submit = useSubmit();

  let transition = async () => {
    switch (state) {
      case "loading": {
        try {
          await linkGitHubAccount();
          setState("success");
        } catch (error) {
          console.error(error);
          setError(error.message);
          setState("error");
        }
        break;
      }
      case "success": {
        let user = await getClientsideUser();
        let githubProvider = user.providerData.find(
          (provider) => provider.providerId === "github.com"
        );
        submit(
          { githubId: githubProvider.uid, idToken: await getIdToken() },
          {
            // FIXME: Remix has a bug in useSubmit requiring location.origin
            action: window.location.origin + "/dashboard/discuss",
            method: "post",
            replace: true,
          }
        );
      }
      case "error": {
        setTimeout(() => {
          setState("idle");
        }, 2000);
      }
    }
  };

  useEffect(() => {
    transition();
  }, [state]);

  return (
    <div className="px-4 py-4 bg-gray-200 min-h-screen">
      <div className="max-w-xl m-auto">
        <div className="bg-white mt-12 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Link Your GitHub Account
            </h3>
            <div className="mt-2 text-sm leading-5 text-gray-500">
              <p>
                In order to give you access to Remix Discuss, we need to link
                your GitHub account to your account.
              </p>
            </div>
            <div className="mt-5">
              <LoadingButton
                aria-describedby={state === "idle" ? "message" : "error"}
                onClick={() => setState("loading")}
                ariaErrorAlert="There was an error linking your account"
                ariaLoadingAlert="Linking account, please wait..."
                ariaSuccessAlert="Account linked, redirecting!"
                ariaText="Link GitHubAccount"
                icon={<IconGitHub className="h-5 w-5" />}
                iconError={<IconError className="h-5 w-5" />}
                iconLoading={<BeatSpinner />}
                iconSuccess={<IconCheck className="h-5 w-5" />}
                state={state}
                text="Link GitHub Account"
                textLoading="Loading..."
                type="submit"
                className="py-2 px-4 border-2 border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:border-yellow-500"
              />
            </div>
            {error && (
              <p id="error" className="text-red-600 mt-5">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
