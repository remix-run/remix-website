import React from "react";
import Alert from "@reach/alert";
import VisuallyHidden from "@reach/visually-hidden";
import BeatSpinner from "./BeatSpinner";
import { FaCheck, FaExclamation } from "react-icons/fa";

export default function LoadingButton({
  text,
  loadingText,
  successText,
  errorText,
  icon,
  state, // idle, loading, success, error
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      className={`
        ${className}
        ${state === "idle" ? "opacity-50" : ""}
        inline-block neon-button rounded font-bold 
      `}
    >
      {/* no clue why I need this */}
      <div style={{ height: 1 }} />
      <div className="relative">
        {/* forces the size to be as big as the biggest text */}
        <div aria-hidden="true" className="invisible h-full py-1 px-10">
          {loadingText.length > text.length ? loadingText : loadingText}
        </div>

        <div
          aria-hidden={!["idle", "valid"].includes(state)}
          className={`
            ${["idle", "valid"].includes(state) ? "opacity-100" : "opacity-0"}
            absolute top-0 left-0 w-full h-full py-1 pr-2
            transition duration-300 ease-in-out
        `}
        >
          {text}
        </div>

        <div
          aria-hidden={state !== "loading"}
          className={`
            ${state === "loading" ? "opacity-100 delay-100" : "opacity-0 ml-4"}
            ${state === "error" || state === "success" ? "-ml-4" : ""}
            absolute top-0 left-0 w-full h-full py-1 pr-2
            transition-all duration-300 ease-in-out
        `}
        >
          {loadingText}
        </div>

        <div aria-hidden className="absolute top-0 right-0 h-full w-full">
          <div style={{ height: "0.4rem" }} />
          <div
            className={`
              ${["idle", "valid"].includes(state) ? "opacity-100" : "opacity-0"}
              absolute right-0 h-full pr-2
              transition duration-300 ease-in-out
              text-xl
            `}
          >
            {icon}
          </div>
          <div
            style={{ height: "1em", top: "0.5em" }}
            className={`
              ${state === "loading" ? "opacity-100" : "opacity-0"}
              absolute right-0 h-full pr-2
              transition delay-100 duration-300 ease-in-out
            `}
          >
            <BeatSpinner />
          </div>
        </div>

        <div
          aria-hidden={!["success", "thanks"].includes(state)}
          aria-label={successText}
          className="absolute top-0 right-0 h-full w-full text-center"
        >
          <FaCheck
            className={`
              ${
                ["success", "thanks"].includes(state)
                  ? "opacity-100"
                  : "opacity-0 ml-4"
              }
              transition-all delay-100 duration-300 ease-in-out
              inline mt-2
            `}
          />
        </div>

        <div
          aria-hidden={state !== "error"}
          aria-label={errorText}
          className="absolute top-0 right-0 h-full w-full text-center"
        >
          <FaExclamation
            className={`
              ${state === "error" ? "opacity-100" : "opacity-0 ml-4"}
              transition-all delay-100 duration-300 ease-in-out
              inline mt-2 text-red-700
            `}
          />
        </div>
      </div>
      <VisuallyHidden>
        {state === "loading" ? (
          <Alert key="loading">{loadingText}</Alert>
        ) : state === "success" ? (
          <Alert key="success">{successText}</Alert>
        ) : state === "error" ? (
          <Alert key="error">{errorText}</Alert>
        ) : null}
      </VisuallyHidden>
    </button>
  );
}
