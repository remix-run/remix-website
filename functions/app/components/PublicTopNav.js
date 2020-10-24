import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function PublicTopNav() {
  return (
    <header className="relative z-10 bg-gray-900 flex items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
      <div className="md:flex items-center">
        <a href="/components" className="block w-24">
          <Logo />
        </a>
      </div>
      <div className="flex text-sm leading-5">
        <TopNavLink
          children="Buy"
          to="/buy"
          icon={
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          }
        />
        <TopNavLink
          children="Features"
          to="/features"
          icon={
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          }
        />
        <TopNavLink
          children="Sign in"
          to="/login"
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          }
        />
      </div>
    </header>
  );
}

function TopNavLink({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center ml-4 font-medium text-gray-300 hover:text-gray-200 active:text-white sm:ml-12"
    >
      <svg
        className="hidden sm:inline h-6 w-6 mr-1"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {icon}
      </svg>{" "}
      {children}
    </Link>
  );
}
