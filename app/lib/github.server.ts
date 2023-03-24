import { Octokit } from "octokit";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

if (process.env.NODE_ENV !== "test" && !GITHUB_TOKEN) {
  throw new Error("Missing GITHUB_TOKEN");
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
export { octokit };
