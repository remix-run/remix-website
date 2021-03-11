import { config } from "./firebase.server";
import { db } from "./db.server";
import { Octokit } from "@octokit/core";
import { processBase64Markdown } from "./markdown.server";

let octokit = new Octokit({ auth: config.github.token });

export let addToRepo = async (uid: string, githubId: string) => {
  let { data: githubUser } = await octokit.request("GET /user/{id}", {
    id: githubId,
  });
  await octokit.request("PUT /repos/{owner}/{repo}/collaborators/{username}", {
    owner: "remix-run",
    repo: "discuss",
    username: githubUser.login,
    permission: "pull",
  });
  await db.users.doc(uid).update({ githubLogin: githubUser.login });
};

export let getRemixVersionReleaseNotes = async (version) => {
  let res = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner: "remix-run",
    repo: "remix",
    path: `docs/releases/${version}.md`,
  });

  return {
    version,
    html: await processBase64Markdown(res.data.content),
  };
};

export let getRemixReleaseNotes = async () => {
  let res = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner: "remix-run",
    repo: "remix",
    path: "docs/releases",
  });
  return res.data.map((file) => file.name.replace(/\.md$/, ""));
};

export let getRemixChanges = async () => {
  let res = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner: "remix-run",
    repo: "remix",
    path: "CHANGES.md",
  });
  return processBase64Markdown(res.data.content);
};
