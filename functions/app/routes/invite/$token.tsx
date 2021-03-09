import React, { useEffect, useRef, useState } from "react";
import { useRouteData, useSubmit } from "@remix-run/react";
import { Link, useLocation, useParams } from "react-router-dom";
import Logo from "../../components/Logo";
import type { LoaderFunction, ActionFunction } from "@remix-run/data";
import { json, redirect } from "@remix-run/data";
import { Response } from "@remix-run/data";
import { db } from "../../utils/db.server";
import {
  addTokenMember,
  getToken,
  getTokenMembersSnapshot,
} from "../../utils/tokens.server";
import LoadingButton, { styles } from "../../components/LoadingButton";
import {
  createEmailUser,
  getIdToken,
  signInWithGitHub,
} from "../../utils/firebase.client";
import {
  IconCheck,
  IconError,
  IconLock,
  IconGitHub,
  BeatSpinner,
} from "../../components/icons";
import { createUserSession, rootStorage } from "../../utils/sessions";
import Hero from "../../components/Hero";

enum TokenCodes {
  Invalid,
  Full,
  Valid,
}

export let loader: LoaderFunction = async ({ request, params }) => {
  // TODO: send the session error message
  let tokenRef = await db.tokens.doc(params.token).get();

  if (!tokenRef.exists) {
    return json({ code: TokenCodes.Invalid }, { status: 404 });
  }

  let membersSnapshot = await getTokenMembersSnapshot(params.token);
  if (membersSnapshot.size >= tokenRef.data().quantity) {
    return json({ code: TokenCodes.Full }, { status: 402 });
  }

  let session = await rootStorage.getSession(request.headers.get("Cookie"));
  let error = session.get("error");

  return json(
    { code: TokenCodes.Valid, error },
    {
      header: {
        "Set-Cookie": await rootStorage.commitSession(session),
      },
    }
  );
};

export let action: ActionFunction = async ({ request, params }) => {
  // firebase in dev redirects to 5001 😩
  let url = new URL(request.url);
  let origin = url.protocol + "//" + url.host;

  let searchParams = new URLSearchParams(await request.text());
  let idToken = searchParams.get("idToken");

  try {
    await addTokenMember(idToken, params.token);
    return createUserSession(idToken);
  } catch (e) {
    // no idea what happened ...
    let session = await rootStorage.getSession(request.headers.get("Cookie"));
    session.set("error", e.message);
    return redirect(`${origin}/invite/${params.token}`, {
      headers: {
        "Set-Cookie": await rootStorage.commitSession(session),
      },
    });
  }
};

export function meta() {
  return {
    title: "Join a Remix License",
  };
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

enum State {
  Idle,
  CreatingUser,
  AddingToken,
  Success,
  Error,
}

function RegistrationForm() {
  let params = useParams();
  let [state, setState] = useState<State>(State.Idle);
  let [authMethod, setAuthMethod] = useState<"github" | "password">(null);
  let [error, setError] = useState<Error>(null);
  let [formValues, setFormValues] = useState({
    email: "",
    password: "",
    verify: "",
  });
  let submit = useSubmit();
  let data = useRouteData<{ code?: TokenCodes; error?: string }>();
  let emailRef = useRef(null);

  let formIsValid =
    formValues.email.match(/.+@.+/) &&
    formValues.password.length >= 6 &&
    formValues.password === formValues.verify;

  async function transition() {
    switch (state) {
      case State.CreatingUser: {
        try {
          // fake it so we get SOME fun animations
          await new Promise((res) => setTimeout(res, 1000));
          if (authMethod === "github") {
            await signInWithGitHub();
          } else {
            await createEmailUser(formValues.email, formValues.password);
          }
          setState(State.AddingToken);
        } catch (error) {
          setError(error);
          setState(State.Error);
        }
        break;
      }
      case State.AddingToken: {
        // do the rest server-side with Remix
        submit(
          { idToken: await getIdToken() },
          {
            action: window.location.origin + `/invite/${params.token}`,
            method: "post",
          }
        );
        break;
      }
      case State.Error: {
        if (authMethod === "password") emailRef.current.select();
        break;
      }
    }
  }

  useEffect(() => {
    transition();
  }, [state]);

  useEffect(() => {
    // remix action returned an error, move the client side machine along
    if (state === State.AddingToken && data.error) {
      setError(new Error(data.error));
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
            verify: form.verify.value,
          });
        }}
        onSubmit={(event) => {
          event.preventDefault();
          setAuthMethod("password");
          setState(State.CreatingUser);
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
              className="-mt-1 appearance-none rounded-none relative block w-full px-3 py-2 border-2 border-gray-700 placeholder-gray-500 text-gray-200 bg-gray-800 focus:outline-none focus:border-yellow-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
          <div>
            <label htmlFor="verify" className="sr-only">
              Verify Password
            </label>
            <input
              id="verify"
              name="verify"
              type="password"
              autoComplete="off"
              required
              className="-mt-1 appearance-none rounded-none relative block w-full px-3 py-2 border-2 border-gray-700 placeholder-gray-500 text-gray-200 bg-gray-800 rounded-b-md focus:outline-none  focus:border-yellow-500 focus:z-10 sm:text-sm"
              placeholder="Verify Password"
            />
          </div>
        </div>
        <div>
          <LoadingButton
            ariaErrorAlert={"There was an error creating your account"}
            ariaLoadingAlert={
              state === State.CreatingUser
                ? "Registering account, please wait..."
                : state === State.AddingToken
                ? "Adding to license, please wait..."
                : "Loading..."
            }
            ariaSuccessAlert="Account created! Redirecting."
            ariaText="Register Account"
            icon={<IconLock className="h-5 w-5 text-blue-700" />}
            iconError={<IconError className="h-5 w-5" />}
            iconLoading={<BeatSpinner />}
            iconSuccess={<IconCheck className="h-5 w-5" />}
            state={
              authMethod !== "password"
                ? "idle"
                : state === State.CreatingUser || state === State.AddingToken
                ? "loading"
                : state === State.Error
                ? "error"
                : state === State.Success
                ? "success"
                : "idle"
            }
            text="Login/Create Account"
            textLoading={
              state === State.CreatingUser
                ? "Registering..."
                : state === State.AddingToken
                ? "Adding to license..."
                : "Loading..."
            }
            type="submit"
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
            ? "Account form is now valid and ready to submit"
            : "Account form is now invalid."}
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
            setState(State.CreatingUser);
          }}
          ariaErrorAlert={"There was an error creating your account"}
          ariaLoadingAlert={
            state === State.CreatingUser
              ? "Registering account with GitHub, please wait..."
              : state === State.AddingToken
              ? "Adding license, please wait..."
              : "Loading..."
          }
          ariaSuccessAlert="Account created! Redirecting."
          ariaText="Login/Create Account"
          disabled={authMethod && authMethod !== "github"}
          icon={<IconGitHub className="h-5 w-5" />}
          iconError={<IconError className="h-5 w-5" />}
          iconLoading={<BeatSpinner />}
          iconSuccess={<IconCheck className="h-5 w-5" />}
          state={
            authMethod !== "github"
              ? "idle"
              : state === State.CreatingUser || state === State.AddingToken
              ? "loading"
              : state === State.Error
              ? "error"
              : state === State.Success
              ? "success"
              : "idle"
          }
          text="Sign in with GitHub"
          textLoading={
            state === State.CreatingUser
              ? "Signing in with GitHub..."
              : state === State.AddingToken
              ? "Adding license..."
              : "Loading..."
          }
          className={`w-full py-2 px-4 border-2 border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:border-yellow-500 ${
            authMethod !== "github" ? "" : "opacity-50"
          }`}
        />
      </div>
    </div>
  );
}

export default function Invite() {
  let data = useRouteData();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-0 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 -mt-24">
        <Hero />
        {data.code === TokenCodes.Valid && (
          <h2 className="mt-2 text-center font-bold text-gray-200" id="message">
            Let's get you added to this license!
          </h2>
        )}
        {data.code === TokenCodes.Valid ? (
          <RegistrationForm />
        ) : data.code === TokenCodes.Invalid ? (
          <Invalid />
        ) : data.code === TokenCodes.Full ? (
          <Full />
        ) : (
          <div>Impossible state!</div>
        )}
      </div>
    </div>
  );
}

function Full() {
  return (
    <div className="text-center">
      <h2 className="text-3xl tracking-tight leading-10 font-extrabold text-gray-100 sm:text-4xl sm:leading-none md:text-5xl">
        License is Full
      </h2>
      <p className="mt-3 mx-auto max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
        You've been invited to join a Remix Team license. Unfortunately, all
        seats have been used on it. Please tell the person who gave you this
        link to purchase more seats at{" "}
        <a className="text-aqua-500" href="https://remix.run/dashboard">
          https://remix.run/dashboard
        </a>
        .
      </p>
    </div>
  );
}

function Invalid() {
  return (
    <div className="text-center">
      <h2 className="text-3xl tracking-tight leading-10 font-extrabold text-gray-100 sm:text-4xl sm:leading-none md:text-5xl">
        Invalid License
      </h2>
      <p className="mt-3 mx-auto max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
        The link you were given doesn't point to a valid license. Please contact
        the person who gave it to you and try again.
      </p>
    </div>
  );
}
