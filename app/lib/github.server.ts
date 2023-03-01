import { Octokit } from "octokit";
import { env } from "~/env.server";

export const octokit = new Octokit({ auth: env.GITHUB_TOKEN });
