import React from "react";
import { useRouteData } from "@remix-run/react";

export function headers() {
  return {
    "Cache-Control": "max-age=3600"
  };
}

export default function DashboardIndex() {
  return (
    <div className="px-4 py-4 bg-gray-200 min-h-screen">
      <div className="max-w-7xl m-auto">
        <AccountInfo />
        <Tokens />
      </div>
    </div>
  );
}

let getNpmRc = token =>
  `//npm.remix.run/:_authToken=${token}\n@remix-run:registry=https://npm.remix.run`;

function Tokens() {
  let { licenses } = useRouteData();
  return licenses.map((license, index) => (
    <div
      key={index}
      className="mt-12 bg-white shadow overflow-hidden sm:rounded-lg"
    >
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {license.price.product.name}
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-0">
        <dl>
          <DataListItem
            first
            label="License Key"
            value={
              <div>
                <div className="flex truncate italic text-sm text-gray-600">
                  <KeyIcon /> {license.token.id}
                </div>
              </div>
            }
            actions={<CopyButton value={license.token.id} />}
          />
          <DataListItem
            label=".npmrc config"
            value={
              <textarea
                readOnly
                className="resize-none block w-full rounded-md border border-gray-300 p-2 h-15 font-mono text-xs text-gray-600"
                value={getNpmRc(license.token.id)}
              />
            }
            actions={<CopyButton value={getNpmRc(license.token.id)} />}
          />
          <DataListItem
            label="Issued"
            value={
              <BrowserOnly>
                {new Date(
                  license.token.issuedAt._seconds * 1000
                ).toLocaleDateString()}
              </BrowserOnly>
            }
          />
          {license.token.role === "owner" && license.token.quantity > 1 ? (
            <>
              <DataListItem
                label="Seats Taken"
                value={
                  <div>
                    {license.token.members.length}/{license.token.quantity}
                  </div>
                }
              />

              {license.token.members.length < license.token.quantity ? (
                <DataListItem
                  label="Invitation URL"
                  value={
                    <div>
                      <div className="flex truncate italic text-sm text-gray-600 mb-3">
                        <LinkIcon /> https://remix.run/invite/{license.token.id}
                      </div>
                      <InfoBox>
                        Invite team members to this license so they can access
                        docs and support
                      </InfoBox>
                    </div>
                  }
                  actions={
                    <CopyButton
                      value={`https://remix.run/invite/${license.token.id}`}
                    />
                  }
                />
              ) : (
                <DataListItem
                  label="Invitation URL"
                  value={
                    <InfoBox>
                      You've used up all the seats on your license
                    </InfoBox>
                  }
                />
              )}
              <DataListItem
                label="Team Members"
                value={
                  <ul className="border border-gray-200 rounded-md">
                    {license.token.members.map((member, index) => (
                      <li
                        key={index}
                        className={`${
                          index > 0 ? "border-t border-gray-200" : ""
                        } pl-3 pr-4 py-3 flex items-center justify-between text-sm leading-5`}
                      >
                        <div className="w-0 flex-1 flex items-center">
                          <svg
                            className="flex-shrink-0 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="ml-2 flex-1 w-0 truncate">
                            {member}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {/* will add remove buttons here */}
                        </div>
                      </li>
                    ))}
                  </ul>
                }
              />
            </>
          ) : (
            <DataListItem
              label="License Owner"
              value={license.token.ownerEmail}
            />
          )}
        </dl>
      </div>
    </div>
  ));
}

function KeyIcon() {
  return (
    <svg
      className="flex-shrink-0 h-5 w-5 text-gray-400 mr-1"
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
  );
}

function BrowserOnly({ children }) {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line
  let [firstRender, setFirstRender] = React.useState(true);
  // eslint-disable-next-line
  React.useLayoutEffect(() => {
    setFirstRender(false);
  }, []);
  return firstRender ? null : children;
}

function CopyButton({ value }) {
  let [copied, setCopied] = React.useState();

  React.useEffect(() => {
    if (copied) {
      let id = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(id);
    }
  }, [copied]);

  return (
    <button
      className="w-28 inline-flex items-center justify-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-gray-900 bg-gray-300 hover:bg-gray-200  active:bg-gray-400 transition ease-in-out duration-150"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
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
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function DataListItem({ label, value, actions, first = false }) {
  return (
    <div
      className={`mt-8 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-4 ${
        first ? "" : "sm:border-t sm:border-gray-200"
      } sm:px-6 sm:py-5`}
    >
      <dt className="text-sm leading-5 font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
        {actions ? (
          <div className="flex justify-between text-sm leading-5">
            <div className="w-0 flex-1 flex items-center">{value}</div>
            <div className="ml-4 flex-shrink-0">{actions}</div>
          </div>
        ) : (
          <div className="text-sm leading-5">{value}</div>
        )}
      </dd>
    </div>
  );
}

function AccountInfo() {
  let { sessionUser, user, stripeCustomer } = useRouteData();
  return (
    <div className="mt-12 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Account Information
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-0">
        <dl>
          <div className="mt-8 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt className="text-sm leading-5 font-medium text-gray-500">
              Name
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="w-0 flex-1 flex items-center">
                  {sessionUser.name}
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
              Email address
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="w-0 flex-1 flex items-center">{user.email}</div>
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
          {stripeCustomer && (
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
                    <a
                      href="/dashboard/billing"
                      className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                    >
                      Change at Stripe
                    </a>
                  </div>
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function InfoBox({ children }) {
  return (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm leading-5 text-blue-700">{children}</p>
        </div>
      </div>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg
      className="mr-1 flex-shrink-0 h-5 w-5 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
        clipRule="evenodd"
      />
    </svg>
  );
}
