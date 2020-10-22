import React, { useEffect, useState, useRef } from "react";
import Logo, { useLogoAnimation } from "../components/Logo";
import LoadingButton from "../components/LoadingButton";
import { MdEmail } from "react-icons/md";
import VisuallyHidden from "@reach/visually-hidden";
import * as CacheControl from "../utils/CacheControl";

export function headers() {
  return CacheControl.public;
}

export function meta() {
  return {
    title: "Remix Newsletter",
    description:
      "Subscribe for weekly updates on Remix and techniques to build better websites.",
  };
}

export default function NewsLetter() {
  let [state, setState] = useState("idle"); // idle | valid | loading | error | success | thanks
  let [data, setData] = useState({ name: "", email: "" });

  let [colors, changeColors] = useLogoAnimation();

  let errorRef = useRef();
  let formRef = useRef();
  let thanksRef = useRef();

  ////////////////////////////////////////
  // effects

  // The request to the mailing list
  useEffect(() => {
    if (state === "loading") {
      // if the request is fast we still want to see some fun animations!
      let animationPromise = new Promise((res) => setTimeout(res, 2000));
      let subscribePromise = subscribeToMailingList(data.name, data.email);
      Promise.all([animationPromise, subscribePromise])
        .then(([, res]) => {
          if (res.error) {
            setState("error");
            setData({ ...data, error: res.error });
          } else {
            setState("success");
          }
        })
        .catch((error) => {
          setState("error");
          setData({ ...data, error });
        });
    }
  }, [state, data]);

  // animate the logo on an interval while loading
  useEffect(() => {
    if (["loading", "success", "thanks"].includes(state)) {
      let id = setInterval(changeColors, 250);
      return () => clearInterval(id);
    }
  }, [state, colors, changeColors]);

  // manage focus on state changes
  useEffect(() => {
    if (state === "error") {
      errorRef.current.focus();
    } else if (state === "thanks") {
      thanksRef.current.focus();
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

  let handleSubmit = (event) => {
    event.preventDefault();
    let [name, email] = event.target.elements;
    setData({ name: name.value, email: email.value });
    setState("loading");
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
              transition duration-300 delay-1000
            `}
          >
            <form
              autoComplete="off"
              ref={formRef}
              onSubmit={handleSubmit}
              className={`
              flex justify-center flex-wrap sm:flex-no-wrap
            `}
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
              <LoadingButton
                className="m-1 w-full sm:w-auto"
                state={state}
                text="Subscribe"
                loadingText="Subscribing..."
                successText="Successfully Subscribed"
                errorText="Subscription Error"
                icon={<MdEmail />}
                onFocus={changeColors}
                type="submit"
                disabled={state !== "valid"}
              >
                Subscribe
              </LoadingButton>
            </form>
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
              absolute top-0 left-0 w-full text-center outline-none
              transition duration-300 delay-1100
            `}
          >
            <div
              ref={errorRef}
              tabIndex="-1"
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
            tabIndex="-1"
            aria-hidden={state !== "thanks"}
            className={`
              ${
                state === "thanks"
                  ? "opacity-100 z-10"
                  : "opacity-0 transform -translate-y-2 pointer-events-none"
              }
              absolute top-0 left-0 w-full text-center outline-none
              transition duration-300 delay-1100
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
        w-full sm:w-56 py-1 px-2 text-lg rounded
        focus:outline-none
        focus:shadow-yellow bg-gray-700 placeholder-gray-400
        disabled:opacity-50
        m-1
      `}
      {...props}
    />
  );
}

async function subscribeToMailingList(name, email) {
  let res = await fetch(`/api/subscribeEmail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      charset: "utf-8",
    },
    body: JSON.stringify({ email, name }),
  });

  let json = await res.json();

  if (res.status === 500) {
    throw new Error(json.message);
  }

  return json;
}
