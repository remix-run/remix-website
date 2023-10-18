import fs from "fs";
import path from "path";
import yaml from "yaml";

// This is relative to where this code ends up in the build, not the source
const dataPath = path.join(__dirname, "..", "data");

// Is it okay to just read and export this data. We shouldn't need an LRU cache since
// we don't have multiple pages, just the list of examples we want to show
export const showcaseExamples: ShowcaseExample[] = yaml.parse(
  fs.readFileSync(path.join(dataPath, "showcase.yaml")).toString(),
);

export interface ShowcaseExample {
  name: string;
  description: string;
  link: string;
  imgSrc: string;
  videoSrc: string;
}
