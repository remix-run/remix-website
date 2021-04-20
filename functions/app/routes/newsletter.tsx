import React, { useEffect, useState, useRef } from "react";
import Logo, { useLogoAnimation } from "../components/Logo";
import LoadingButton, { styles as lbStyles } from "../components/LoadingButton";
import VisuallyHidden from "@reach/visually-hidden";
import * as CacheControl from "../utils/CacheControl";
import { subscribeToForm } from "../utils/ck.server";
import { json } from "@remix-run/node";
import redirect from "../utils/redirect";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { usePendingFormSubmit, useRouteData, Form } from "@remix-run/react";
import { newsletterStorage } from "../utils/sessions";
import { IconCheck, IconError } from "../components/icons";
import BeatSpinner from "../components/BeatSpinner";

export let loader: LoaderFunction = async function subscribeEmail({ request }) {
  let session = await newsletterStorage.getSession(
    request.headers.get("Cookie")
  );
  if (session.has("newsletter")) {
    return json(session.data, {
      headers: {
        "Set-Cookie": await newsletterStorage.destroySession(session),
      },
    });
  } else {
    return null;
  }
};

export let action: ActionFunction = async ({ request }) => {
  let session = await newsletterStorage.getSession(
    request.headers.get("Cookie")
  );
  let params = new URLSearchParams(await request.text());
  let email = params.get("email");
  let name = params.get("name");
  let form = "1334747";

  try {
    await subscribeToForm(email, name, form);
    session.set("newsletter", "success");
  } catch (error) {
    session.set("newsletter", "error");
    session.set("error", error.message);
  }
  return redirect(request, "/newsletter", {
    headers: {
      "Set-Cookie": await newsletterStorage.commitSession(session),
    },
  });
};

export function headers() {
  return CacheControl.pub;
}

export function links() {
  return [{ rel: "stylesheet", href: lbStyles }];
}

export function meta() {
  return {
    title: "Remix Newsletter",
    description:
      "Subscribe for updates on Remix and techniques to build better websites.",
  };
}

export default function NewsLetter() {
  let sessionData = useRouteData();
  let pendingSubmit = usePendingFormSubmit();
  let [state, setState] = useState<
    "idle" | "valid" | "loading" | "error" | "success" | "thanks"
  >("idle");
  let [data, setData] = useState<{
    name: string;
    email: string;
    error?: Error;
  }>({
    name: "",
    email: "",
    error: null,
  });

  let [colors, changeColors] = useLogoAnimation();

  let errorRef = useRef(null);
  let formRef = useRef(null);
  let thanksRef = useRef(null);

  useEffect(() => {
    if (pendingSubmit) {
      setState("loading");
    }
  }, [pendingSubmit]);

  useEffect(() => {
    if (!sessionData) return;
    // artificial delay so there's a bit of an animation still
    // TODO: useTransitionBlocker would be perfect for this (again)
    new Promise((res) => setTimeout(res, 1000)).then(() => {
      if (sessionData.newsletter === "success") {
        setState("success");
      } else if (sessionData.newsletter === "error") {
        setState("error");
        setData({ ...data, error: sessionData.error });
      }
    });
  }, [sessionData]);

  // animate the logo on an interval while loading
  useEffect(() => {
    if (["loading", "success", "thanks"].includes(state)) {
      let id = setInterval(changeColors, 250);
      return () => clearInterval(id);
    }
  }, [state, colors, changeColors]);

  // Reset after 5 seconds
  useEffect(() => {
    if (state === "thanks") {
      setTimeout(() => {
        setState("idle");
        if (formRef.current != undefined) {
          formRef.current.reset();
        }
        // avoid flash of no name in the animation
        setTimeout(() => {
          setData({ name: "", email: "", error: null });
        }, 500);
      }, 5000);
    }
  }, [state]);

  // manage focus on state changes
  useEffect(() => {
    if (state === "error") {
      if (errorRef.current) {
        errorRef.current.focus();
      }
    } else if (state === "thanks") {
      if (thanksRef.current) {
        thanksRef.current.focus();
      }
    }
  }, [state]);

  // move on to "thanks" from "success"
  useEffect(() => {
    if (state === "success") {
      setTimeout(() => {
        setState("thanks");
      }, 500);
    }
  }, [state]);

  ////////////////////////////////////////
  // event handlers
  let handleInputFocus = () => {
    changeColors();
    transitionIfDataIsValid(data);
  };

  let validateEmail = (email) => email.indexOf("@") > -1;

  let transitionIfDataIsValid = (nextData) => {
    let { name, email } = nextData;
    if (name.length > 0 && validateEmail(email)) {
      setState("valid");
    } else {
      setState("idle");
    }
  };

  let handleNameChange = (event) => {
    let nextData = { ...data, name: event.target.value };
    setData(nextData);
    transitionIfDataIsValid(nextData);
    changeColors();
  };

  let handleEmailChange = (event) => {
    let nextData = { ...data, email: event.target.value };
    setData({ ...data, email: event.target.value });
    transitionIfDataIsValid(nextData);
    changeColors();
  };

  ////////////////////////////////////////
  // The party's about to get started
  return (
    <div className="bg-gray-900 min-h-screen p-8 sm:p-20">
      <div className="text-gray-100 max-w-3xl m-auto">
        <Logo colors={colors} className="w-full" />
        <div className="relative">
          <div
            aria-hidden={["thanks", "error"].includes(state)}
            className={`
              ${
                ["thanks", "error"].includes(state)
                  ? "opacity-0 transform translate-y-2 pointer-events-none"
                  : "opacity-100 z-10"
              }
              relative z-10
              transition duration-300 delay-500
            `}
          >
            <Form
              method="post"
              autoComplete="off"
              ref={formRef}
              className="flex justify-center flex-wrap sm:flex-no-wrap"
            >
              <VisuallyHidden id="subscription-description">
                Subscribe to our mailing list
              </VisuallyHidden>
              <Input
                required
                autoComplete="off"
                onFocus={handleInputFocus}
                onChange={handleNameChange}
                aria-label="name"
                aria-describedby="subscription-description"
                type="text"
                name="name"
                placeholder="First Name"
                disabled={["loading", "success", "thanks"].includes(state)}
              />
              <Input
                required
                autoComplete="off"
                onFocus={handleInputFocus}
                onChange={handleEmailChange}
                aria-label="email"
                aria-describedby="subscription-description"
                type="email"
                name="email"
                placeholder="Email"
                disabled={["loading", "success", "thanks"].includes(state)}
              />
              <div className="w-full">
                <LoadingButton
                  state={
                    state === "thanks" || state === "valid" ? "idle" : state
                  }
                  icon={<EmailIcon />}
                  type="submit"
                  disabled={state !== "valid"}
                  ariaErrorAlert={"There was an error subscribing"}
                  ariaLoadingAlert="Loading..."
                  ariaSuccessAlert="You're subscribed!"
                  ariaText="Subscribe to email list"
                  iconError={<IconError className="h-5 w-5" />}
                  iconLoading={<BeatSpinner />}
                  iconSuccess={<IconCheck className="h-5 w-5" />}
                  text="Subscribe"
                  textLoading="Loading..."
                  onFocus={changeColors}
                  className={`w-full m-1 py-2 px-4 border-2 border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:border-yellow-500 ${
                    state === "valid" ? "" : "opacity-50"
                  }`}
                />
              </div>
            </Form>
            <div className="text-center leading-tight mt-4 text-gray-400">
              <p className="font-light text-gray-400 sm:text-2xl sm:leading-7">
                Subscribe for weekly updates on Remix and techniques to build
                better websites. We respect your privacy, unsubscribe at any
                time.
              </p>
            </div>
          </div>
          <div
            aria-hidden={state !== "error"}
            className={`
              ${
                state === "error"
                  ? "opacity-100 z-10"
                  : "opacity-0 transform -translate-y-2 pointer-events-none"
              }
              text-gray-200 text-center
              absolute top-0 left-0 w-full outline-none
              transition duration-300 delay-500
            `}
          >
            <div
              ref={errorRef}
              tabIndex={-1}
              className="outline-none text-xl text-white font-bold"
            >
              Something went wrong
            </div>
            <div>
              Looks like our request is failing or being blocked by an
              extension.
            </div>
            <div>
              <a
                className="text-blue-500 underline"
                href="https://remix.ck.page/c4e9df94f6"
              >
                Please try our plain HTML version
              </a>
            </div>
          </div>
          <div
            ref={thanksRef}
            tabIndex={-1}
            aria-hidden={state !== "thanks"}
            className={`
              ${
                state === "thanks"
                  ? "opacity-100 z-10"
                  : "opacity-0 transform -translate-y-2 pointer-events-none"
              }
              absolute top-0 left-0 w-full text-center outline-none
              transition duration-300 delay-500
            `}
          >
            <p className="text-2xl mb-0">
              Thanks, {data.name}! You're gonna love this.
            </p>
            <p className="text-gray-400 mt-0">
              Please check your email to confirm, otherwise you won't get our
              email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////

function Input(props) {
  return (
    <input
      className={`
        w-full sm:w-56 py-1 px-2 text-lg rounded-md
        focus:outline-none border-2 border-transparent
        focus:border-yellow-500 bg-gray-700 placeholder-gray-400
        disabled:opacity-50
        m-1
      `}
      {...props}
    />
  );
}

function EmailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5"
    >
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}
