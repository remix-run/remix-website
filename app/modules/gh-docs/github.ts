import { Octokit } from "octokit";
import { env } from "~/env.server";

const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

export { octokit };
