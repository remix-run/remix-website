import React from "react";
import { authenticate, createUserSession } from "../../utils/firebase";
import { createCheckoutClient } from "../../utils/checkout";
import * as CacheControl from "../../utils/CacheControl";
import { useRouteData } from "@remix-run/react";

export function headers() {
  return CacheControl.nostore;
}

// const fakeUser = {
//   name: "Ryan Florence",
//   avatar_url: "https://avatars0.githubusercontent.com/u/100200?v=4",
//   email: "rpflorence@gmail.com",
//   login: "ryanflorence",
// };

export default function Indie() {
  let { type, qty } = useRouteData();

  // idle | autheticating | error
  let [state, setState] = React.useState("idle");
  let [data, setData] = React.useState({ error: null });

  let focusRef = React.useRef();
  let manageFocus = React.useRef(false);

  React.useEffect(() => {
    if (manageFocus.current) {
      if (focusRef.current) focusRef.current.focus();
    }

    if (manageFocus.current === false) {
      manageFocus.current = true;
    }
  }, [state, data]);

  async function startSignin() {
    setState("authenticating");
    try {
      let { user } = await authenticate();
      let idToken = await user.getIdToken(true);
      await createUserSession(idToken);
      await createCheckoutClient(user.uid, user.email, idToken, type, qty);
      // redirects to stripe checkout and then success_url
    } catch (error) {
      console.error(error);
      setData({ error });
      setState("error");
    }
  }

  return (
    <main className="lg:min-h-screen lg:relative bg-gray-900">
      <LogInToGitHub
        state={state}
        data={data}
        startSignin={startSignin}
        focusRef={focusRef}
      />
      <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full bg-gray-100">
        <Octocat />
      </div>
    </main>
  );
}

function LogInToGitHub({ state, data, startSignin, focusRef }) {
  return (
    <div className="mx-auto max-w-8xl w-full pt-16 pb-20 text-center lg:py-48 lg:text-left">
      <div className="px-4 lg:w-1/2 sm:px-8 xl:pr-16">
        <h2 className="text-4xl tracking-tight leading-10 font-extrabold text-gray-100 sm:text-5xl sm:leading-none md:text-6xl lg:text-5xl xl:text-6xl">
          Do you have a GitHub Account?
        </h2>
        <p className="mt-3 mx-auto max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl lg:mx-0">
          Remix support is done primarily through GitHub, so we figure it's
          easiest to just use your GitHub account for Remix. GitHub accounts are
          free.
        </p>
        <div className="mt-10 max-w-2xl mx-auto lg:mx-0 sm:flex sm:justify-center lg:justify-start">
          <div className="flex-1 rounded-md shadow">
            <button
              ref={
                state === "idle" || state === "authenticating"
                  ? focusRef
                  : undefined
              }
              disabled={state === "authenticating"}
              type="button"
              onClick={startSignin}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 active:bg-green-400 transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
            >
              {state === "idle"
                ? "Yes! Login with GitHub"
                : state === "authenticating"
                ? "Logging in ..."
                : state === "error"
                ? "Try logging in again"
                : "Impossible state, tell @ryanflorence he sucks at programming!"}
            </button>
          </div>
          <div className="flex-1 mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <a
              href="https://github.com/join"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-gray-600 bg-white hover:text-gray-900 transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
            >
              No, Create an Account
            </a>
          </div>
        </div>
        {state === "error" && (
          <div className="mt-10 max-w-2xl mx-auto lg:mx-0 rounded-md bg-red-50 p-4 text-left">
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
                <h3
                  ref={focusRef}
                  tabIndex="-1"
                  className="focus:outline-none text-sm leading-5 font-medium text-red-800"
                >
                  Oops! There was an error, here's message:
                </h3>
                <div className="mx-2 mt-2 text-sm leading-5 text-red-700 italic">
                  <p>{data.error.message}</p>
                </div>
                <div className="mt-2 text-sm leading-5 text-red-800">
                  <p>Please try again.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Octocat() {
  return (
    <svg
      className="absolute inset-0 w-full h-full object-cover p-10 sm:p-12 lg:p-24"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-0.2 -1 379 334"
    >
      <path
        id="puddle"
        fill="#9CDAF1"
        d="m296.94 295.43c0 20.533-47.56 37.176-106.22 37.176-58.67 0-106.23-16.643-106.23-37.176s47.558-37.18 106.23-37.18c58.66 0 106.22 16.65 106.22 37.18z"
      />
      <g id="shadow-legs" fill="#7DBBE6">
        <path d="m161.85 331.22v-26.5c0-3.422-.619-6.284-1.653-8.701 6.853 5.322 7.316 18.695 7.316 18.695v17.004c6.166.481 12.534.773 19.053.861l-.172-16.92c-.944-23.13-20.769-25.961-20.769-25.961-7.245-1.645-7.137 1.991-6.409 4.34-7.108-12.122-26.158-10.556-26.158-10.556-6.611 2.357-.475 6.607-.475 6.607 10.387 3.775 11.33 15.105 11.33 15.105v23.622c5.72.98 11.71 1.79 17.94 2.4z" />
        <path d="m245.4 283.48s-19.053-1.566-26.16 10.559c.728-2.35.839-5.989-6.408-4.343 0 0-19.824 2.832-20.768 25.961l-.174 16.946c6.509-.025 12.876-.254 19.054-.671v-17.219s.465-13.373 7.316-18.695c-1.034 2.417-1.653 5.278-1.653 8.701v26.775c6.214-.544 12.211-1.279 17.937-2.188v-24.113s.944-11.33 11.33-15.105c0-.01 6.13-4.26-.48-6.62z" />
      </g>
      <path
        id="cat"
        d="m378.18 141.32l.28-1.389c-31.162-6.231-63.141-6.294-82.487-5.49 3.178-11.451 4.134-24.627 4.134-39.32 0-21.073-7.917-37.931-20.77-50.759 2.246-7.25 5.246-23.351-2.996-43.963 0 0-14.541-4.617-47.431 17.396-12.884-3.22-26.596-4.81-40.328-4.81-15.109 0-30.376 1.924-44.615 5.83-33.94-23.154-48.923-18.411-48.923-18.411-9.78 24.457-3.733 42.566-1.896 47.063-11.495 12.406-18.513 28.243-18.513 47.659 0 14.658 1.669 27.808 5.745 39.237-19.511-.71-50.323-.437-80.373 5.572l.276 1.389c30.231-6.046 61.237-6.256 80.629-5.522.898 2.366 1.899 4.661 3.021 6.879-19.177.618-51.922 3.062-83.303 11.915l.387 1.36c31.629-8.918 64.658-11.301 83.649-11.882 11.458 21.358 34.048 35.152 74.236 39.484-5.704 3.833-11.523 10.349-13.881 21.374-7.773 3.718-32.379 12.793-47.142-12.599 0 0-8.264-15.109-24.082-16.292 0 0-15.344-.235-1.059 9.562 0 0 10.267 4.838 17.351 23.019 0 0 9.241 31.01 53.835 21.061v32.032s-.943 11.33-11.33 15.105c0 0-6.137 4.249.475 6.606 0 0 28.792 2.361 28.792-21.238v-34.929s-1.142-13.852 5.663-18.667v57.371s-.47 13.688-7.551 18.881c0 0-4.723 8.494 5.663 6.137 0 0 19.824-2.832 20.769-25.961l.449-58.06h4.765l.453 58.06c.943 23.129 20.768 25.961 20.768 25.961 10.383 2.357 5.663-6.137 5.663-6.137-7.08-5.193-7.551-18.881-7.551-18.881v-56.876c6.801 5.296 5.663 18.171 5.663 18.171v34.929c0 23.6 28.793 21.238 28.793 21.238 6.606-2.357.474-6.606.474-6.606-10.386-3.775-11.33-15.105-11.33-15.105v-45.786c0-17.854-7.518-27.309-14.87-32.3 42.859-4.25 63.426-18.089 72.903-39.591 18.773.516 52.557 2.803 84.873 11.919l.384-1.36c-32.131-9.063-65.692-11.408-84.655-11.96.898-2.172 1.682-4.431 2.378-6.755 19.25-.80 51.38-.79 82.66 5.46z"
      />
      <path
        id="face"
        fill="#F4CBB2"
        d="m258.19 94.132c9.231 8.363 14.631 18.462 14.631 29.343 0 50.804-37.872 52.181-84.585 52.181-46.721 0-84.589-7.035-84.589-52.181 0-10.809 5.324-20.845 14.441-29.174 15.208-13.881 40.946-6.531 70.147-6.531 29.07-.004 54.72-7.429 69.95 6.357z"
      />
      <path
        id="eyes"
        fill="#FFF"
        d="m160.1 126.06 c0 13.994-7.88 25.336-17.6 25.336-9.72 0-17.6-11.342-17.6-25.336 0-13.992 7.88-25.33 17.6-25.33 9.72.01 17.6 11.34 17.6 25.33z m94.43 0 c0 13.994-7.88 25.336-17.6 25.336-9.72 0-17.6-11.342-17.6-25.336 0-13.992 7.88-25.33 17.6-25.33 9.72.01 17.6 11.34 17.6 25.33z"
      />
      <g fill="#AD5C51">
        <path
          id="pupils"
          d="m154.46 126.38 c0 9.328-5.26 16.887-11.734 16.887s-11.733-7.559-11.733-16.887c0-9.331 5.255-16.894 11.733-16.894 6.47 0 11.73 7.56 11.73 16.89z m94.42 0 c0 9.328-5.26 16.887-11.734 16.887s-11.733-7.559-11.733-16.887c0-9.331 5.255-16.894 11.733-16.894 6.47 0 11.73 7.56 11.73 16.89z"
        />
        <circle id="nose" cx="188.5" cy="148.56" r="4.401" />
        <path
          id="mouth"
          d="m178.23 159.69c-.26-.738.128-1.545.861-1.805.737-.26 1.546.128 1.805.861 1.134 3.198 4.167 5.346 7.551 5.346s6.417-2.147 7.551-5.346c.26-.738 1.067-1.121 1.805-.861s1.121 1.067.862 1.805c-1.529 4.324-5.639 7.229-10.218 7.229s-8.68-2.89-10.21-7.22z"
        />
      </g>
      <path
        id="octo"
        fill="#C3E4D8"
        d="m80.641 179.82 c0 1.174-1.376 2.122-3.07 2.122-1.693 0-3.07-.948-3.07-2.122 0-1.175 1.377-2.127 3.07-2.127 1.694 0 3.07.95 3.07 2.13z m8.5 4.72 c0 1.174-1.376 2.122-3.07 2.122-1.693 0-3.07-.948-3.07-2.122 0-1.175 1.377-2.127 3.07-2.127 1.694 0 3.07.95 3.07 2.13z m5.193 6.14 c0 1.174-1.376 2.122-3.07 2.122-1.693 0-3.07-.948-3.07-2.122 0-1.175 1.377-2.127 3.07-2.127 1.694 0 3.07.95 3.07 2.13z m4.72 7.08 c0 1.174-1.376 2.122-3.07 2.122-1.693 0-3.07-.948-3.07-2.122 0-1.175 1.377-2.127 3.07-2.127 1.694 0 3.07.95 3.07 2.13z m5.188 6.61 c0 1.174-1.376 2.122-3.07 2.122-1.693 0-3.07-.948-3.07-2.122 0-1.175 1.377-2.127 3.07-2.127 1.694 0 3.07.95 3.07 2.13z m7.09 5.66 c0 1.174-1.376 2.122-3.07 2.122-1.693 0-3.07-.948-3.07-2.122 0-1.175 1.377-2.127 3.07-2.127 1.694 0 3.07.95 3.07 2.13z m9.91 3.78 c0 1.174-1.376 2.122-3.07 2.122-1.693 0-3.07-.948-3.07-2.122 0-1.175 1.377-2.127 3.07-2.127 1.694 0 3.07.95 3.07 2.13z m9.87 0 c0 1.174-1.376 2.122-3.07 2.122-1.693 0-3.07-.948-3.07-2.122 0-1.175 1.377-2.127 3.07-2.127 1.694 0 3.07.95 3.07 2.13z m10.01 -1.64 c0 1.174-1.376 2.122-3.07 2.122-1.693 0-3.07-.948-3.07-2.122 0-1.175 1.377-2.127 3.07-2.127 1.694 0 3.07.95 3.07 2.13z"
      />
      <path
        id="drop"
        fill="#9CDAF1"
        d="m69.369 186.12l-3.066 10.683s-.8 3.861 2.84 4.546c3.8-.074 3.486-3.627 3.223-4.781z"
      />
    </svg>
  );
}
