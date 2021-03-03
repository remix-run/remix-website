import React, { useEffect, useRef, useState } from "react";
import { useRouteData, Link, useSubmit } from "@remix-run/react";
import { json, redirect } from "@remix-run/data";
import type { ActionFunction, LoaderFunction } from "@remix-run/data";

import { fulfillOrder, getStripeSession } from "../../utils/checkout.server";
import { buyStorage, createUserSession } from "../../utils/sessions";
import * as CacheControl from "../../utils/CacheControl";

import Hero from "../../components/Hero";
import { IconLock, IconError, IconCheck } from "../../components/icons";
import BeatSpinner from "../../components/BeatSpinner";
import { getIdToken, createEmailUser } from "../../utils/firebase.client";
import LoadingButton, { styles } from "../../components/LoadingButton";

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let stripeSessionId = url.searchParams.get("session_id");

  let stripeSession = await getStripeSession(stripeSessionId);

  // we have a valid stripe session, let's register the user
  if (stripeSession) {
    let session = await buyStorage.getSession(request.headers.get("Cookie"));
    return json(
      {
        stripeSessionId,
        // @ts-expect-error
        email: stripeSession.customer_details?.email || "",
        error: session.get("error"),
      },
      {
        headers: {
          "Set-Cookie": await buyStorage.destroySession(session),
        },
      }
    );
  } else {
    // invalid or already completed stripe session, what are you doing here?!
    return json(null, {
      status: 404,
      headers: { "Cache-Control": CacheControl.nostore },
    });
  }
};

export let action: ActionFunction = async ({ request }) => {
  // firebase in dev redirects to 5001 😩
  let url = new URL(request.url);
  let origin = url.protocol + "//" + url.host;

  let params = new URLSearchParams(await request.text());
  let idToken = params.get("idToken");
  let stripeSessionId = params.get("stripeSessionId");

  try {
    await fulfillOrder(idToken, stripeSessionId);
    return createUserSession(idToken);
  } catch (e) {
    // no idea what happened ...
    let session = await buyStorage.getSession(request.headers.get("Cookie"));
    session.set("error", e.message);
    return redirect(
      `${origin}/buy/order/complete?session_id=${stripeSessionId}`,
      {
        headers: {
          "Set-Cookie": await buyStorage.commitSession(session),
        },
      }
    );
  }
};

export function headers({ loaderHeaders }) {
  return { "Cache-Control": "no-store" };
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

enum State {
  Idle,
  CreatingUser,
  FulfillingPurchase,
  Success,
  Error,
}

function EmailPasswordForm() {
  let [authState, setAuthState] = useState<State>(State.Idle);
  let [error, setError] = useState<Error>(null);
  let [formValues, setFormValues] = useState({
    email: "",
    password: "",
    verify: "",
  });
  let submit = useSubmit();
  let data = useRouteData();
  let emailRef = useRef(null);

  let formIsValid =
    formValues.email.match(/.+@.+/) &&
    formValues.password.length >= 6 &&
    formValues.password === formValues.verify;

  async function transition() {
    switch (authState) {
      case State.CreatingUser: {
        try {
          // fake it so we get SOME fun animations
          await new Promise((res) => setTimeout(res, 1000));
          await createEmailUser(formValues.email, formValues.password);
          setAuthState(State.FulfillingPurchase);
        } catch (error) {
          setError(error);
          setAuthState(State.Error);
        }
        break;
      }
      case State.FulfillingPurchase: {
        // do the rest server-side with Remix
        submit(
          {
            idToken: await getIdToken(),
            stripeSessionId: data.stripeSessionId,
          },
          {
            action: window.location.origin + "/buy/order/complete",
            replace: true,
            method: "post",
          }
        );
        break;
      }
      case State.Error: {
        emailRef.current.select();
        break;
      }
    }
  }
  useEffect(() => {
    transition();
  }, [authState]);

  useEffect(() => {
    // remix action returned an error, move the client side machine along
    if (authState === State.FulfillingPurchase && data.error) {
      setError(new Error(data.errorMessage));
      setAuthState(State.Error);
    }
  }, [data]);

  return (
    <form
      className="mt-8 space-y-6"
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
        setAuthState(State.CreatingUser);
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
              authState === State.Error ? "error-message" : "message"
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
            authState === State.CreatingUser
              ? "Registering account, please wait..."
              : authState === State.FulfillingPurchase
              ? "Generating license, please wait..."
              : "Loading..."
          }
          ariaSuccessAlert="Account created! Redirecting."
          ariaText="Register Account"
          disabled={!formIsValid}
          icon={<IconLock className="h-5 w-5 text-blue-700" />}
          iconError={<IconError className="h-5 w-5" />}
          iconLoading={<BeatSpinner />}
          iconSuccess={<IconCheck className="h-5 w-5" />}
          state={
            authState === State.CreatingUser ||
            authState === State.FulfillingPurchase
              ? "loading"
              : authState === State.Error
              ? "error"
              : authState === State.Success
              ? "success"
              : "idle"
          }
          text="Create Account"
          textLoading={
            authState === State.CreatingUser
              ? "Registering..."
              : authState === State.FulfillingPurchase
              ? "Generating license..."
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
  );
}

export default function CompleteOrder() {
  let data = useRouteData();

  if (data == null) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-0 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 -mt-24">
        <Hero />
        <h2 className="mt-2 text-center font-bold text-gray-200" id="message">
          {data.error
            ? "There was a problem creating your account:"
            : "Payment complete! Let's get you an account"}
        </h2>
        <EmailPasswordForm />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="bg-gray-900 h-screen">
      <Hero title="Checkout Session Not Found">
        <p className="mt-8 mb-4">
          Sorry, we couldn't find the checkout session. You may have already
          registered, so try{" "}
          <Link to="/login" className="underline">
            logging in
          </Link>
          .
        </p>
        <p className="my-4">
          If you think this is a mistake please email us at hello@remix.run with
          your stripe receipt number (it should be in your email).
        </p>
        <p className="my-4">
          Otherwise, please{" "}
          <Link className="underline" to="/buy">
            buy a license
          </Link>{" "}
          first.
        </p>
      </Hero>
    </div>
  );
}
