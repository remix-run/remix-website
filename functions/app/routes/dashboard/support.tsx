import React from "react";
import { Form, Link } from "@remix-run/react";

export default function Support() {
  return (
    <div className="px-4 py-4 bg-gray-200 min-h-screen">
      <div className="max-w-7xl m-auto">
        <div className="mt-12 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Support
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-0">
            <dl>
              <DataListItem
                first
                label="Remix Chat"
                value={
                  <div className="w-4/5">
                    Join a Discord chat server with other Remix users and the
                    developers of Remix. This is the most active place to get
                    help and report issues to Michael and Ryan as we ramp up to
                    a stable release.
                  </div>
                }
                actions={
                  <a
                    className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                    href="/dashboard/chat"
                  >
                    Visit Remix Chat
                  </a>
                }
              />
              <DataListItem
                label="Remix Source Repo"
                value={
                  <div className="w-4/5">
                    We will soon be giving access to the source repo of Remix to
                    our customers to be able to file issues, read the source,
                    and follow our development progress more directly.
                  </div>
                }
                actions={
                  null
                  // <Form action="/dashboard/discuss" method="post">
                  //   <button
                  //     className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                  //     type="submit"
                  //   >
                  //     Visit Remix Repo
                  //   </button>
                  // </Form>
                }
              />
              <DataListItem
                label="Email"
                value={
                  <div className="w-4/5">
                    You can email us if you aren't getting the help you need
                    with the other support channels.
                  </div>
                }
                actions={
                  <a
                    className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                    href="mailto:hello@remix.run"
                  >
                    hello@remix.run
                  </a>
                }
              />
              <DataListItem
                label="Twitter"
                value={
                  <div className="w-4/5">
                    Maybe not the best support channel, but we're happy to chat
                    on twitter, too.
                  </div>
                }
                actions={
                  <a
                    className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                    href="https://twitter.com/remix_run"
                  >
                    @remix_run
                  </a>
                }
              />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataListItem({ label, value, actions, first = false }) {
  return (
    <div
      className={`mt-8 sm:mt-0 sm:grid sm:grid-cols-4 sm:gap-4 ${
        first ? "" : "sm:border-t sm:border-gray-200"
      } sm:px-6 sm:py-5`}
    >
      <dt className="text-sm leading-5 font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-3">
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
