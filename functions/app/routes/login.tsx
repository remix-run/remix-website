import React, { useEffect, useRef, useState } from "react";
import { useRouteData, Link, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/data";
import redirect from "../utils/redirect";
import type { ActionFunction, LoaderFunction } from "@remix-run/data";

import { fulfillOrder, getStripeSession } from "../utils/checkout.server";
import { rootStorage, createUserSession } from "../utils/sessions";
import * as CacheControl from "../utils/CacheControl";

import Hero from "../components/Hero";
import {
  IconLock,
  IconError,
  IconCheck,
  IconGitHub,
} from "../components/icons";
import BeatSpinner from "../components/BeatSpinner";
import {
  getIdToken,
  createEmailUser,
  signInWithGitHub,
  signInWithEmail,
} from "../utils/firebase.client";
import LoadingButton, { styles } from "../components/LoadingButton";
import { getCustomer } from "../utils/session.server";

export let loader: LoaderFunction = async ({ request }) => {
  let customer = await getCustomer(request);
  if (customer) return redirect(request, "/dashboard");

  let session = await rootStorage.getSession(request.headers.get("Cookie"));
  let cookie = await rootStorage.destroySession(session);
  console.log(session.data);

  return json(
    { error: session.get("error"), loggedOut: session.get("loggedOut") },
    { headers: { "Set-Cookie": cookie } }
  );
};

export let action: ActionFunction = async ({ request }) => {
  let params = new URLSearchParams(await request.text());
  let idToken = params.get("idToken");

  try {
    return createUserSession(idToken);
  } catch (e) {
    let session = await rootStorage.getSession(request.headers.get("Cookie"));
    session.set("error", e.message);
    let cookie = await rootStorage.commitSession(session);

    return redirect(`/login`, { headers: { "Set-Cookie": cookie } });
  }
};

export function headers() {
  return CacheControl.nostore;
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

enum State {
  Idle,
  GettingIdToken,
  CreatingServerSession,
  Error,

  // can't even get to Success and show a cool check mark until we have
  // useBeforeTransitionComplete
  // Success,
}

// This is like, 95% the same as the registration form in order.complete.tsx
function LoginForm() {
  let [state, setState] = useState<State>(State.Idle);
  let [authMethod, setAuthMethod] = useState<"github" | "password">(null);
  let [error, setError] = useState<Error>(null);
  let [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  let submit = useSubmit();
  let data = useRouteData();
  let emailRef = useRef(null);

  let formIsValid =
    formValues.email.match(/.+@.+/) && formValues.password.length >= 6;

  async function transition() {
    switch (state) {
      case State.GettingIdToken: {
        try {
          // fake it so we get SOME fun animations
          await new Promise((res) => setTimeout(res, 1000));
          if (authMethod === "github") {
            await signInWithGitHub();
          } else {
            await signInWithEmail(formValues.email, formValues.password);
          }
          setState(State.CreatingServerSession);
        } catch (error) {
          setError(error);
          setState(State.Error);
        }
        break;
      }
      case State.CreatingServerSession: {
        // do the rest server-side with Remix
        submit(
          {
            idToken: await getIdToken(),
          },
          {
            // FIXME: Remix has a bug in useSubmit requiring location.origin
            action: window.location.origin + "/login",
            replace: true,
            method: "post",
          }
        );
        break;
      }
      case State.Error: {
        if (authMethod === "password") emailRef.current.select();
        setTimeout(() => {
          setState(State.Idle);
        }, 3000);
        break;
      }
    }
  }
  useEffect(() => {
    transition();
  }, [state]);

  useEffect(() => {
    // remix action returned an error, move the client side machine along
    if (state === State.CreatingServerSession && data.error) {
      setError(new Error(data.errorMessage));
      setState(State.Error);
    }
  }, [data]);

  return (
    <div className="mt-8">
      <form
        className="space-y-6"
        onChange={(event) => {
          let form = event.currentTarget;
          setFormValues({
            email: form.email.value,
            password: form.password.value,
          });
        }}
        onSubmit={(event) => {
          event.preventDefault();
          setAuthMethod("password");
          setState(State.GettingIdToken);
        }}
      >
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              ref={emailRef}
              autoFocus
              aria-describedby={
                state === State.Error ? "error-message" : "message"
              }
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={data.email}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border-2 border-gray-700 placeholder-gray-500 text-gray-200 bg-gray-800 rounded-t-md focus:outline-none focus:border-yellow-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="off"
              required
              minLength={6}
              className="-mt-1 appearance-none rounded-none relative block w-full px-3 py-2 border-2 border-gray-700 placeholder-gray-500 text-gray-200  rounded-b-md bg-gray-800 focus:outline-none focus:border-yellow-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>
        <div>
          <LoadingButton
            ariaErrorAlert="There was an error logging in."
            ariaLoadingAlert="Authenticating, please wait..."
            ariaSuccessAlert="Redirecting to dashboard"
            ariaText="Sign in"
            icon={<IconLock className="h-5 w-5 text-blue-700" />}
            iconError={<IconError className="h-5 w-5" />}
            iconLoading={<BeatSpinner />}
            iconSuccess={<IconCheck className="h-5 w-5" />}
            state={
              authMethod !== "password"
                ? "idle"
                : state === State.GettingIdToken
                ? "loading"
                : state === State.Error
                ? "error"
                : state === State.CreatingServerSession
                ? "success"
                : "idle"
            }
            text="Sign in"
            textLoading={"Authenticating..."}
            type="submit"
            disabled={!formIsValid}
            className={`w-full py-2 px-4 border-2 border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:border-yellow-500 ${
              formIsValid ? "" : "opacity-50"
            }`}
          />
        </div>
        {error && (
          <p id="error-message" className="text-red-600 text-center">
            {error.message}
          </p>
        )}
        <div className="sr-only" aria-live="polite">
          {formIsValid
            ? "Sign in form is now valid and ready to submit"
            : "Sign in form is now invalid."}
        </div>
      </form>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm leading-5">
          <span className="px-2 bg-gray-900 text-gray-300">Or you can</span>
        </div>
      </div>
      <div>
        <LoadingButton
          onClick={() => {
            setAuthMethod("github");
            setState(State.GettingIdToken);
          }}
          ariaErrorAlert="There was an error creating your account"
          ariaLoadingAlert="Authenticating with GitHub, please wait..."
          ariaSuccessAlert="Redirecting to dashboard"
          ariaText="Sign in With GitHub"
          icon={<IconGitHub className="h-5 w-5" />}
          iconError={<IconError className="h-5 w-5" />}
          iconLoading={<BeatSpinner />}
          iconSuccess={<IconCheck className="h-5 w-5" />}
          state={
            authMethod !== "github"
              ? "idle"
              : state === State.GettingIdToken
              ? "loading"
              : state === State.Error
              ? "error"
              : state === State.CreatingServerSession
              ? "success"
              : "idle"
          }
          text="Sign in with GitHub"
          textLoading="Authenticating..."
          className="w-full py-2 px-4 border-2 border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:border-yellow-500"
        />
      </div>
    </div>
  );
}

export default function Login() {
  let data = useRouteData();
  console.log({ data });
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-0 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 -mt-24">
        <Hero />
        {data.loggedOut && <LoggedOutMessage />}
        <LoginForm />
      </div>
    </div>
  );
}

function LoggedOutMessage() {
  return (
    <div className="rounded-md bg-green-950 p-4 mt-10 max-w-lg mx-auto text-left">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm leading-5 font-medium text-green-300">
            You have been logged out
          </p>
        </div>
      </div>
    </div>
  );
}
