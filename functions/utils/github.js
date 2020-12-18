const { config, db } = require("./firebase");
const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: config.github.token });
const { processBase64Markdown } = require("./markdown");

exports.addToDiscussRepo = async (uid, id) => {
  let { data: githubUser } = await octokit.request("GET /user/{id}", { id });
  await octokit.request("PUT /repos/{owner}/{repo}/collaborators/{username}", {
    owner: "remix-run",
    repo: "discuss",
    username: githubUser.login,
    permission: "pull",
  });
  await db.doc(`users/${uid}`).update({ githubLogin: githubUser.login });
};

exports.getRemixVersionReleaseNotes = async (version) => {
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

exports.getRemixReleaseNotes = async () => {
  let res = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner: "remix-run",
    repo: "remix",
    path: "docs/releases",
  });
  return res.data.map((file) => file.name.replace(/\.md$/, ""));
};

exports.getRemixChanges = async () => {
  let res = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner: "remix-run",
    repo: "remix",
    path: "CHANGES.md",
  });
  return processBase64Markdown(res.data.content);
};
