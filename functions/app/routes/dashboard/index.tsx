import React from "react";
import { useRouteData } from "@remix-run/react";
import { json } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";
import { unwrapSnapshot } from "../../utils/firebase.server";
import { requireCustomer } from "../../utils/session.server";
import { stripe } from "../../utils/stripe.server";
import { db } from "../../utils/db.server";
import * as CacheControl from "../../utils/CacheControl";
import { IconUser, IconKey, IconCopy, IconLink } from "../../components/icons";
import {
  DescriptionList,
  DescriptionListItem,
} from "../../components/DescriptionList";
import BrowserOnly from "../../components/BrowserOnly";
import InfoBox from "../../components/InfoBox";
import CopyButton from "../../components/CopyButton";

export let loader: LoaderFunction = ({ request }) => {
  return requireCustomer(request)(async ({ sessionUser, user }) => {
    async function getTokens(uid: string) {
      let snapshot = await db.xTokensUsers
        .where("userRef", "==", db.users.doc(uid))
        .get();

      let xTokens = unwrapSnapshot(snapshot);
      return Promise.all(
        xTokens.map(async (xTokenUser) => {
          let tokenRef = await xTokenUser.tokenRef.get();
          let token = { id: tokenRef.id, ...tokenRef.data() };
          // FIXME: the types suck when you call `get` on references in
          // `data()`, figure out how to get them to not suck?
          let ownerRef = db.users.doc(token.ownerRef.id);
          let owner = (await ownerRef.get()).data();

          if (xTokenUser.role === "owner") {
            let members = await getMembers(xTokenUser.tokenRef);
            return {
              ...token,
              role: xTokenUser.role,
              members,
              ownerEmail: owner.email,
            };
          }

          // member token
          else if (xTokenUser.role === "member") {
            let owner = (await token.ownerRef.get()).data();
            delete token.ownerRef;
            return {
              ...token,
              role: xTokenUser.role,
              ownerEmail: owner.email,
            };
          }
        })
      );
    }

    async function getMembers(tokenRef) {
      let snapshot = await db.xTokensUsers
        .where("tokenRef", "==", tokenRef)
        .get();
      let xTokensUsers = unwrapSnapshot(snapshot);
      return await Promise.all(
        xTokensUsers.map(async (xTokenUser) => {
          let user = await xTokenUser.userRef.get();
          return user.data().email;
        })
      );
    }

    async function getLicenses(uid: string) {
      let tokens = await getTokens(uid);
      let licenses = await Promise.all(
        tokens.map(async (token) => {
          let price = await stripe.prices.retrieve(token.price, {
            expand: ["product"],
          });
          return { token, price };
        })
      );

      return licenses;
    }

    ///////////////////////////////////////////////////////////////////////////
    let [stripeCustomer, licenses] = await Promise.all([
      user.stripeCustomerId
        ? stripe.customers.retrieve(user.stripeCustomerId)
        : null,
      getLicenses(user.uid),
    ]);

    return json(
      {
        sessionUser,
        user,
        stripeCustomer,
        licenses,
      },
      {
        headers: CacheControl.short,
      }
    );
  });
};

export function headers() {
  return CacheControl.short;
}

export default function DashboardIndex() {
  let { user, stripeCustomer, licenses } = useRouteData();

  let getNpmRc = (token) =>
    `//npm.remix.run/:_authToken=${token}\n@remix-run:registry=https://npm.remix.run`;

  return (
    <div className="px-4 py-4 bg-gray-200 min-h-screen">
      <div className="max-w-7xl m-auto">
        <DescriptionList title="Account Information">
          <DescriptionListItem
            first
            label="Email Address"
            value={user.email}
            actions={
              <span className="font-medium text-gray-600 hover:text-gray-500 transition duration-150 ease-in-out">
                TODO: Change Email Address
              </span>
            }
          />
          {stripeCustomer && (
            <DescriptionListItem
              label="Billing Email Address"
              value={stripeCustomer.email}
              actions={
                <a
                  href="/dashboard/billing"
                  className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
                >
                  Change at Stripe
                </a>
              }
            />
          )}
        </DescriptionList>
        {licenses.map((license, index) => (
          <DescriptionList key={index} title={license.price.product.name}>
            <DescriptionListItem
              first
              label="License Key"
              value={
                <div>
                  <div className="flex truncate italic text-sm text-gray-600">
                    <IconKey className="flex-shrink-0 h-5 w-5 text-gray-400 mr-1" />{" "}
                    {license.token.id}
                  </div>
                </div>
              }
              actions={<CopyButton value={license.token.id} />}
            />
            <DescriptionListItem
              label=".npmrc config (recommended)"
              value={
                <div className="w-full">
                  <p className="my-2 text-gray-800">
                    We recommend putting your token into an environment variable
                    so you don't risk accidentally committing your token to git,
                    and your CI/build server will need to do it this way anyway.
                  </p>
                  <textarea
                    readOnly
                    className="resize-none block w-full rounded-md border border-gray-300 p-2 h-15 font-mono text-xs text-gray-600"
                    value={getNpmRc("${REMIX_REGISTRY_TOKEN}")}
                  />
                </div>
              }
              actions={
                <CopyButton value={getNpmRc("${REMIX_REGISTRY_TOKEN}")} />
              }
            />
            <DescriptionListItem
              label=".npmrc config"
              value={
                <div className="w-full">
                  <p className="my-2 text-gray-800">
                    If you use this method, please ensure that your `.npmrc` is
                    ignored by git.
                  </p>
                  <textarea
                    readOnly
                    className="resize-none block w-full rounded-md border border-gray-300 p-2 h-15 font-mono text-xs text-gray-600"
                    value={getNpmRc(license.token.id)}
                  />
                </div>
              }
              actions={<CopyButton value={getNpmRc(license.token.id)} />}
            />
            <DescriptionListItem
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
                <DescriptionListItem
                  label="Seats Taken"
                  value={
                    <div>
                      {license.token.members.length}/{license.token.quantity}
                    </div>
                  }
                />

                {license.token.members.length < license.token.quantity ? (
                  <DescriptionListItem
                    label="Invitation URL"
                    value={
                      <div>
                        <div className="flex truncate italic text-sm text-gray-600 mb-3">
                          <IconLink className="mr-1 flex-shrink-0 h-5 w-5 text-gray-400" />{" "}
                          https://remix.run/invite/{license.token.id}
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
                  <DescriptionListItem
                    label="Invitation URL"
                    value={
                      <InfoBox>
                        You've used up all the seats on your license
                      </InfoBox>
                    }
                  />
                )}
                <DescriptionListItem
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
                            <IconUser className="flex-shrink-0 h-5 w-5 text-gray-400" />
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
              <DescriptionListItem
                label="License Owner"
                value={license.token.ownerEmail}
              />
            )}
          </DescriptionList>
        ))}
      </div>
    </div>
  );
}
