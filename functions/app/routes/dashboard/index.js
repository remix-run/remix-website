import React from "react";
import { useRouteData } from "@remix-run/react";
import * as CacheControl from "../../utils/CacheControl";

export function headers() {
  return CacheControl.none;
}

function openStripeCustomerPortal() {}

export default function DashboardIndex() {
  let [{ sessionUser, user, stripeCustomer, subscriptions }] = useRouteData();
  return (
    <div className="px-4 py-4 bg-gray-200 min-h-screen">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {sessionUser.name}
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-0">
          <dl>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="text-sm leading-5 font-medium text-gray-500">
                Access Tokens
              </dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="border bg-gray-100 border-gray-200 rounded-md">
                  {subscriptions.map((subscription) => (
                    <li
                      key={subscription.token.id}
                      className="border-t border-gray-200 pl-3 pr-4 py-3 flex items-center justify-between text-sm leading-5"
                    >
                      <div className="w-0 flex-1 flex items-center">
                        <svg
                          className="flex-shrink-0 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate italic text-sm text-gray-600">
                          {subscription.token.id}
                        </span>
                      </div>
                      <div>{subscription.price.product.name} </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-gray-900 bg-gray-300 hover:bg-gray-200  active:bg-gray-400 transition ease-in-out duration-150"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              subscription.token.id
                            );
                          }}
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                          </svg>
                          Copy
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className="mt-8 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
              <dt className="text-sm leading-5 font-medium text-gray-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="w-0 flex-1 flex items-center">
                    {user.email}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a
                      className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                      href="https://github.com/settings/profile"
                    >
                      Change at GitHub
                    </a>
                  </div>
                </div>
              </dd>
            </div>
            <div className="mt-8 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
              <dt className="text-sm leading-5 font-medium text-gray-500">
                Billing Email Address
              </dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="w-0 flex-1 flex items-center">
                    {stripeCustomer.email}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={openStripeCustomerPortal}
                      className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                      href="https://github.com/settings/profile"
                    >
                      Change at Stripe
                    </button>
                  </div>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
