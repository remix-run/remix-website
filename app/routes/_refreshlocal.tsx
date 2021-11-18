import { RouteComponent, ActionFunction, json } from "remix";
import PQueue from "p-queue";

import type { GitHubRelease } from "~/@types/github";
import { saveDocs } from "~/utils/docs/save-docs.server";
import { saveBlogPosts } from "~/utils/save-blog-posts.server";

if (!process.env.AUTH_TOKEN) {
  throw new Error("AUTH_TOKEN env var is not set");
}

const queue = new PQueue({ concurrency: 1 });

async function processDocs(request: Request): Promise<void> {
  const url = new URL(request.url);

  // verify post request
  if (request.method !== "POST") {
    throw new Response("", { status: 405 });
  }

  // verify the token matches or doing it locally
  if (
    request.headers.get("Authorization") !== process.env.AUTH_TOKEN &&
    url.hostname !== "localhost"
  ) {
    throw new Response("", { status: 401 });
  }

  const ref = url.searchParams.get("ref");

  if (!ref) {
    throw new Response('missing "ref" query parameter', { status: 400 });
  }

  console.log(`Refreshing docs for ${url.hostname} for ref ${ref}`);

  // generate docs for specified ref
  let tag = ref.replace(/^refs\/tags\//, "");

  const releasePromise = await fetch(
    `https://api.github.com/repos/${process.env.REPO}/releases/tags/${tag}`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );

  const release = (await releasePromise.json()) as GitHubRelease;

  await Promise.all([saveDocs(ref, release.body)]);
}

let action: ActionFunction = async ({ request }) => {
  try {
    console.log("Adding to queue", queue.size + 1);
    await queue.add(() => processDocs(request));
    console.log("done with request", queue.size);

    return json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ ok: true }, { status: 500 });
  }
};

const RefreshInstance: RouteComponent = () => {
  return <p>nothing to see here</p>;
};

export default RefreshInstance;
export { action };
