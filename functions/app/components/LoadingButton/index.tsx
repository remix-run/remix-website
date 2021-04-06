import React, { ReactEventHandler, useState } from "react";
import styles from "./loading-button.css";

export { styles };

export interface LoadingButtonProps {
  ariaErrorAlert: string;
  ariaLoadingAlert: string;
  ariaSuccessAlert: string;
  ariaText: string;
  icon: React.ReactNode;
  iconError: React.ReactNode;
  iconLoading: React.ReactNode;
  iconSuccess: React.ReactNode;
  state: "idle" | "loading" | "success" | "error";
  text: React.ReactNode;
  textLoading: React.ReactNode;
  onClick?: (event: ReactEventHandler<React.MouseEvent>) => void;
}

let LoadingButton: React.FC<
  LoadingButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({
  ariaErrorAlert,
  ariaLoadingAlert,
  ariaSuccessAlert,
  ariaText,
  icon,
  iconError,
  iconLoading,
  iconSuccess,
  state,
  text,
  textLoading,
  onClick,
  ...props
}) => {
  let [derivedState, setDerivedState] = useState(state);
  let [previousState, setPreviousState] = useState(state);

  if (derivedState !== state) {
    setPreviousState(derivedState);
    setDerivedState(state);
  }

  let getDirection = (activeState: LoadingButtonProps["state"]) =>
    state === activeState
      ? "enter"
      : previousState === activeState
      ? "exit"
      : null;

  let idle = (
    <span
      hidden={state !== "idle"}
      aria-hidden={true}
      data-lb-direction={getDirection("idle")}
    >
      <span data-lb-slider>{text}</span>
      <span data-lb-icon>{icon}</span>
    </span>
  );

  let loading = (
    <span
      hidden={state !== "loading"}
      aria-hidden={true}
      data-lb-direction={getDirection("loading")}
    >
      <span data-lb-slider>{textLoading}</span>
      <span data-lb-icon>{iconLoading}</span>
    </span>
  );

  let success = (
    <span
      hidden={state !== "success"}
      aria-hidden={true}
      data-lb-direction={getDirection("success")}
    >
      <span data-lb-slider>{iconSuccess}</span>
    </span>
  );

  let error = (
    <span
      hidden={state !== "error"}
      aria-hidden={true}
      data-lb-direction={getDirection("error")}
    >
      <span data-lb-slider>{iconError}</span>
    </span>
  );

  let ariaLive =
    state === "loading"
      ? ariaLoadingAlert
      : state === "error"
      ? ariaErrorAlert
      : state === "success"
      ? ariaSuccessAlert
      : "";

  return (
    <button
      aria-label={ariaText}
      data-loading-button
      onClick={(event) => {
        onClick && onClick(event);
        if (event.defaultPrevented) return;
        if (state === "loading") {
          event.preventDefault();
        }
      }}
      {...props}
    >
      {idle}
      {loading}
      {success}
      {error}
      <span className="sr-only" aria-live="assertive">
        {ariaLive}
      </span>
    </button>
  );
};

export default LoadingButton;
