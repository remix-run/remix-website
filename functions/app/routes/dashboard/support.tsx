import React from "react";
import { Form } from "remix";

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
                label="Remix Source Repo"
                value={
                  <div className="w-4/5">
                    Get access to the source repo of Remix to file issues, read
                    the source, and follow our development progress more
                    directly.
                  </div>
                }
                actions={
                  <Form action="/dashboard/github" method="post">
                    <input type="hidden" name="dest" value="repo" />
                    <TextButton type="submit">Visit Remix Repo</TextButton>
                  </Form>
                }
              />
              <DataListItem
                label="Remix Roadmap"
                value={
                  <div className="w-4/5">
                    Get access to the Remix product development board to see
                    what is planned, what's in-progress, and what is recently
                    finished.
                  </div>
                }
                actions={
                  <Form action="/dashboard/github" method="post">
                    <input type="hidden" name="dest" value="roadmap" />
                    <TextButton type="submit">Visit Remix Roadmap</TextButton>
                  </Form>
                }
              />
              <DataListItem
                label="Remix Chat"
                value={
                  <div className="w-4/5">
                    Join a Discord chat server with other Remix users and the
                    developers working on Remix. This is a great place to ask
                    questions and get real-time help.
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
                label="Email"
                value={
                  <div className="w-4/5">
                    Email is best for issues with your account or for reporting
                    security issues you've identified. Please use the other
                    support channels for help with code.
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

function TextButton(props) {
  return (
    <button
      {...props}
      className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
    />
  );
}
