import fs from "fs";
import path from "path";
import yaml from "yaml";

// This is relative to where this code ends up in the build, not the source
const dataPath = path.join(__dirname, "..", "data");

const formatter = new Intl.NumberFormat("en", { notation: "compact" });

export const templates: Template[] = yaml
  .parse(fs.readFileSync(path.join(dataPath, "templates.yaml")).toString())
  // Format the stars here, eventually this will come from GitHub and can be done in that function
  .map((t: { stars: number }) => ({
    ...t,
    stars: formatter.format(t.stars).toLowerCase(),
  }));

export interface Template {
  name: string;
  imgSrc: string;
  description: string;
  repoUrl: string;
  sponsorUrl?: string;
  stars: string;
  initCommand: string;
  tags: string[];
}
