const { config } = require("./firebase");
const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: config.github.token });

function addToPackages(login) {
  console.log("addToPackages", login);
  return octokit.request("PUT /repos/{owner}/{repo}/collaborators/{username}", {
    owner: "remix-run",
    repo: "packages",
    username: login,
    permission: "pull",
  });
}

exports.addToPackages = addToPackages;
