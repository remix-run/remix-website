import React from "react";
import { useRouteData } from "@remix-run/react";
import { json } from "@remix-run/data";
import type { LoaderFunction } from "@remix-run/data";
import { unwrapSnapshot } from "../../utils/firebase.server";
import { requireCustomer } from "../../utils/session.server";
import { stripe } from "../../utils/stripe.server";
import { db, Token, User } from "../../utils/db.server";
import * as CacheControl from "../../utils/CacheControl";
import { IconUser, IconKey, IconCopy, IconLink } from "../../components/icons";
import {
  DescriptionList,
  DescriptionListItem,
} from "../../components/DescriptionList";
import BrowserOnly from "../../components/BrowserOnly";
import InfoBox from "../../components/InfoBox";
import CopyButton from "../../components/CopyButton";
import type Stripe from "stripe";

interface DashboardData {
  account: {
    email: string;
    billingEmail?: string;
  };
  licenses: License[];
}

interface License {
  role: "owner" | "member";
  key: string;
  issuedAt: number;
  quantity: number;
  invitationToken: string;
  members: [{ email: string }];
  name: string;
  ownerEmail: string;
}

// TODO: Some types inside of here are hard to know what's going on, but the
// return value is typed at least! Basically converts all of the database
// collections into a format that's easy for the dashboard to render.
export let loader: LoaderFunction = ({ request }) => {
  return requireCustomer(request)(async ({ sessionUser, user }) => {
    async function getTokens(uid: string) {
      let snapshot = await db.xTokensUsers
        .where("userRef", "==", db.users.doc(uid))
        .get();

      let xTokens = unwrapSnapshot(snapshot);
      return Promise.all(
        xTokens.map(async (xTokenUser) => {
          // TODO: figure out how to infer types on these ref types?
          let tokenDoc = (await xTokenUser.tokenRef.get()) as FirebaseFirestore.DocumentSnapshot<Token>;
          let token = { id: tokenDoc.id, ...tokenDoc.data() };
          let ownerRef = db.users.doc(token.ownerRef.id);
          let owner = (await ownerRef.get()).data();

          if (xTokenUser.role === "owner") {
            let members = await getMembers(xTokenUser.tokenRef);
            let data = {
              ...token,
              role: xTokenUser.role,
              members,
              ownerEmail: owner.email,
            };

            return data;
          }

          // member token
          else if (xTokenUser.role === "member") {
            let owner = (await token.ownerRef.get()).data();
            delete token.ownerRef;
            return {
              ...token,
              role: xTokenUser.role,
              ownerEmail: owner.email,
              members: [owner.email],
            };
          }
        })
      );
    }

    async function getMembers(tokenRef): Promise<string[]> {
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

    async function getLicenses(uid: string): Promise<License[]> {
      let tokens = await getTokens(uid);
      let licenses = await Promise.all(
        tokens.map(async (token) => {
          let price = await stripe.prices.retrieve(token.price, {
            expand: ["product"],
          });
          let product = price.product as Stripe.Product;
          return {
            role: token.role,
            key: token.id,
            issuedAt: token.issuedAt._seconds * 1000,
            quantity: token.quantity,
            invitationToken: token.id,
            name: product.name,
            members: token.members,
            ownerEmail: token.ownerEmail,
          };
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

    let data: DashboardData = {
      account: {
        email: user.email,
        billingEmail:
          stripeCustomer && !stripeCustomer.deleted
            ? (stripeCustomer as Stripe.Customer).email
            : null,
      },
      licenses,
    };

    return json(data, { headers: CacheControl.short });
  });
};

export function headers() {
  return CacheControl.short;
}

export default function DashboardIndex() {
  let { account, licenses } = useRouteData<DashboardData>();

  let getNpmRc = (token) =>
    `//npm.remix.run/:_authToken=${token}\n@remix-run:registry=https://npm.remix.run`;

  return (
    <div className="px-4 py-4 bg-gray-200 min-h-screen">
      <div className="max-w-7xl m-auto">
        <DescriptionList title="Account Information">
          <DescriptionListItem
            first
            label="Email Address"
            value={account.email}
            actions={
              <span className="font-medium text-gray-600 hover:text-gray-500 transition duration-150 ease-in-out">
                TODO: Change Email Address
              </span>
            }
          />
          {account.billingEmail && (
            <DescriptionListItem
              label="Billing Email Address"
              value={account.billingEmail}
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
          <DescriptionList key={index} title={license.name}>
            <DescriptionListItem
              first
              label="License Key"
              value={
                <div>
                  <div className="flex truncate italic text-sm text-gray-600">
                    <IconKey className="flex-shrink-0 h-5 w-5 text-gray-400 mr-1" />{" "}
                    {license.key}
                  </div>
                </div>
              }
              actions={<CopyButton value={license.key} />}
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
                    value={getNpmRc(license.key)}
                  />
                </div>
              }
              actions={<CopyButton value={getNpmRc(license.key)} />}
            />
            <DescriptionListItem
              label="Issued"
              value={
                <BrowserOnly>
                  {new Date(license.issuedAt).toLocaleDateString()}
                </BrowserOnly>
              }
            />
            {license.role === "owner" && license.quantity > 1 ? (
              <>
                <DescriptionListItem
                  label="Seats Taken"
                  value={
                    <div>
                      {license.members.length}/{license.quantity}
                    </div>
                  }
                />

                {license.members.length < license.quantity ? (
                  <DescriptionListItem
                    label="Invitation URL"
                    value={
                      <div>
                        <div className="flex truncate italic text-sm text-gray-600 mb-3">
                          <IconLink className="mr-1 flex-shrink-0 h-5 w-5 text-gray-400" />{" "}
                          https://remix.run/invite/{license.invitationToken}
                        </div>
                        <InfoBox>
                          Invite team members to this license so they can access
                          docs and support
                        </InfoBox>
                      </div>
                    }
                    actions={
                      <CopyButton
                        value={`https://remix.run/invite/${license.invitationToken}`}
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
                      {license.members.map((member, index) => (
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
                value={license.ownerEmail}
              />
            )}
          </DescriptionList>
        ))}
      </div>
    </div>
  );
}
