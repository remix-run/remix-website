import React, { useEffect, useLayoutEffect, useState } from "react";
import { ActionFunction, useRouteData } from "remix";
import { useSubmit } from "remix";
import redirectInternally from "../../utils/redirect";
import { redirect } from "remix";
import { createUserSession, requireCustomer } from "../../utils/session.server";
import { addToGithubEntities } from "../../utils/github.server";
import LoadingButton, { styles } from "../../components/LoadingButton";
import type { LoadingButtonProps } from "../../components/LoadingButton";
import {
  BeatSpinner,
  IconCheck,
  IconError,
  IconGitHub,
} from "../../components/icons";
import {
  firebase,
  getClientsideUser,
  getIdToken,
  linkGitHubAccount,
} from "../../utils/firebase.client";
import { useLocation } from "react-router-dom";

export let action: ActionFunction = async ({ request }) => {
  return requireCustomer(request)(async ({ sessionUser, user }) => {
    let formParams = new URLSearchParams(await request.text());
    let dest = new URL(request.url).searchParams.get("dest") as
      | "repo"
      | "roadmap"
      | null;

    if (dest === null) throw new Error("Missing `dest` form param");

    let repo = "https://github.com/remix-run/remix";
    let roadmap = "https://github.com/orgs/remix-run/projects/1";
    let redirectUrl = dest === "repo" ? repo : roadmap;

    // already associated their account w/ destination
    if (
      (dest === "repo" && user.githubLogin) ||
      (dest === "roadmap" && user.addedToRoadmap)
    ) {
      return redirect(redirectUrl);
    }

    // already linked to GitHub but don't have access to whatever they're going for
    let ghIdentity = sessionUser.firebase.identities["github.com"];
    let githubId = ghIdentity ? ghIdentity[0] : null;
    if (githubId) {
      await addToGithubEntities(sessionUser.uid, githubId);
      return redirect(redirectUrl);
    }

    // linking for the first time from our submit() in this route
    if (formParams.has("githubId") && formParams.has("idToken")) {
      await addToGithubEntities(sessionUser.uid, formParams.get("githubId"));
      // create a new session with this new information
      await createUserSession(request, formParams.get("idToken"));
      return redirect(redirectUrl);
    }

    // haven't linked anything yet, show the component
    return redirectInternally(request, "/dashboard/github");
  });
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function Repo() {
  let [state, setState] = useState<LoadingButtonProps["state"]>("idle");
  let [error, setError] = useState<string>();
  let location = useLocation();
  let submit = useSubmit();
  let clientUser = useClientUser();

  let transition = async () => {
    switch (state) {
      case "loading": {
        try {
          await linkGitHubAccount(clientUser);
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
          {
            githubId: githubProvider.uid,
            idToken: await getIdToken(),
          },
          {
            action: `/dashboard/github?dest=${new URLSearchParams(
              location.search
            ).get("dest")}`,
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

  useLayoutEffect(() => {
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
                In order to give you access to the Remix source repo, we need to
                link your GitHub account to your Remix account.
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

export function useClientUser() {
  let [clientsideUser, setClientsideUser] = useState<firebase.User>(null);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged((user) => {
      setClientsideUser(user);
    });
  }, []);

  return clientsideUser;
}
