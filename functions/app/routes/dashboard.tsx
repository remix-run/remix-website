import React from "react";
import { json } from "@remix-run/data";
import { usePendingLocation, useRouteData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/react";
import { Link } from "react-router-dom";
import Logo, { useLogoAnimation } from "../components/Logo";
import { DataOutlet } from "../components/DataOutlet";
import { requireCustomer } from "../utils/session.server";

export let loader: LoaderFunction = ({ request, context }) => {
  return requireCustomer(
    request,
    context
  )((customer) => {
    return json(customer, {
      headers: {
        "Cache-Control": "max-age=3600",
      },
    });
  });
};

export default function Dashboard() {
  let isPending = !!usePendingLocation();
  let data = useRouteData();

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200">
      <TopNav sessionUser={data.sessionUser} user={data.user} />
      <div
        className={
          isPending
            ? "duration-200 delay-300 transition-opacity opacity-25"
            : ""
        }
      >
        <DataOutlet data={data} />
      </div>
    </div>
  );
}

function TopNavLink({ as: Comp = Link, ...props }: any) {
  return (
    <Comp
      className={`
        inline-flex px-3 py-2 rounded-md text-m font-medium
        text-gray-300 hover:text-white hover:bg-gray-800
        focus:outline-none focus:text-white focus:bg-gray-800
      `}
      {...props}
    />
  );
}

function TopNavLinkMobile({ as: Comp = Link, ...props }: any) {
  return (
    <Comp
      className="flex px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
      {...props}
    />
  );
}

function useFlashingColorsOnTransition() {
  let isPending = usePendingLocation();
  let [colors, changeColors] = useLogoAnimation();
  React.useEffect(() => {
    if (isPending) {
      let id = setTimeout(changeColors, 250);
      return () => clearTimeout(id);
    }
  }, [isPending, changeColors]);
  return colors;
}

function TopNav({ sessionUser, user }) {
  let [isOpen, setIsOpen] = React.useState(false);
  let colors = useFlashingColorsOnTransition();
  let signout = () => {
    window.location.assign("/logout");
  };
  // TODO: this mobile menu isn't very accessible
  return (
    <nav className="sticky top-0 z-10 bg-gray-900 dark:bg-black">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-28">
              <Logo colors={colors} />
            </div>
            <div className="hidden md:block">
              <div className="ml-5 flex items-baseline space-x-4">
                <TopNavLink to=".">
                  <IconHome /> Dashboard
                </TopNavLink>
                <TopNavLink to="docs">
                  <IconDocumentation /> Documentation
                </TopNavLink>
                <TopNavLink to="support">
                  <IconSupport /> Support
                </TopNavLink>
                {user.stripeCustomerId && (
                  <TopNavLink as="a" href="/dashboard/billing">
                    <IconBilling /> Billing
                  </TopNavLink>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <TopNavLink as="button" onClick={signout}>
                <IconSignout /> Sign out
              </TopNavLink>
              <div className="ml-2 relative">
                <img
                  alt=""
                  aria-hidden="true"
                  className="ml-2 h-8 w-8 rounded-full"
                  src={sessionUser.picture}
                />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <MenuButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </div>
        </div>
      </div>
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <TopNavLinkMobile to="." onClick={() => setIsOpen(false)}>
            <IconHome /> Dashboard
          </TopNavLinkMobile>
          <TopNavLinkMobile to="docs" onClick={() => setIsOpen(false)}>
            <IconDocumentation /> Documentation
          </TopNavLinkMobile>
          <TopNavLinkMobile to="support" onClick={() => setIsOpen(false)}>
            <IconSupport /> Support
          </TopNavLinkMobile>
          {user.stripeCustomerId && (
            <TopNavLinkMobile to="billing" onClick={() => setIsOpen(false)}>
              <IconBilling /> Billing
            </TopNavLinkMobile>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-700">
          <div className="flex items-center px-5 space-x-3">
            <div className="flex-shrink-0">
              <img
                aria-hidden="true"
                alt=""
                className="h-10 w-10 rounded-full"
                src={sessionUser.picture}
              />
            </div>
            <div className="space-y-1">
              <div className="text-base font-medium leading-none text-white">
                {sessionUser.name}
              </div>
              <div className="text-sm font-medium leading-none text-gray-400">
                {sessionUser.email}
              </div>
            </div>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <TopNavLinkMobile as="button" onClick={signout}>
              <svg
                className="mr-2 h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>{" "}
              Sign out
            </TopNavLinkMobile>
          </div>
        </div>
      </div>
    </nav>
  );
}

function IconHome() {
  return (
    <svg
      className="mr-2 h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}

function IconDocumentation() {
  return (
    <svg
      className="mr-2 h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconBilling() {
  return (
    <svg
      className="mr-2 h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path
        fillRule="evenodd"
        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconSupport() {
  return (
    <svg
      className="mr-2 h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconSignout() {
  return (
    <svg
      className="mr-2 h-6 w-6"
      stroke="currentColor"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

function MenuButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
    >
      <svg
        className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      <svg
        className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
