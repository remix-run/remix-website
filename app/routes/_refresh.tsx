import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { getFlyInstances } from "~/utils/get-fly-instances.server";

if (!process.env.AUTH_TOKEN) {
  throw new Error("AUTH_TOKEN env var is not set");
}

export async function action({ request }: DataFunctionArgs) {
  // verify post request
  if (request.method !== "POST") {
    throw new Response("", { status: 405 });
  }

  // verify the token matches
  if (request.headers.get("Authorization") !== process.env.AUTH_TOKEN) {
    throw new Response("", { status: 401 });
  }

  const { search, searchParams } = new URL(request.url);

  console.log(
    `Refreshing docs for all instances for ref ${searchParams.get("ref")}`
  );

  try {
    // get all app instances and refresh them
    const instances = await getFlyInstances();

    for (const instance of instances) {
      const url = new URL(instance);
      url.pathname = "/_refreshlocal";
      url.search = search;

      console.log(`forwarding post to ${url.toString()}`);

      // we purposefully don't await, we're just notifying everybody
      fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: process.env.AUTH_TOKEN!,
        },
      });
    }

    console.log(instances);

    return json({ instances });
  } catch (error) {
    console.error(error);
    return json(
      { ok: false },
      { status: error instanceof Response ? error.status : 500 }
    );
  }
}
