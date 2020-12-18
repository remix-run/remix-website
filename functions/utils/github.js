const { config, db } = require("./firebase");
const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: config.github.token });

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

exports.getRemixReleaseNotes = async () => {
  let { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: "remix-run",
      repo: "remix",
      path: "releases",
    }
  );
  return data;
};
