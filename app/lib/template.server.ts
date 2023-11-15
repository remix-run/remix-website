import fs from "fs";
import path from "path";
import yaml from "yaml";

// This is relative to where this code ends up in the build, not the source
const dataPath = path.join(__dirname, "..", "data");

export const templates: Template[] = yaml.parse(
  fs.readFileSync(path.join(dataPath, "templates.yaml")).toString(),
);

export interface Template {
  name: string;
  imgSrc: string;
  description: string;
  repoUrl: string;
  sponsorUrl?: string;
  stars: number;
  initCommand: string;
  tags: string[];
}
