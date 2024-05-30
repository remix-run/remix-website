import yaml from "yaml";
import showcaseYamlFileContents from "../../data/showcase.yaml?raw";

export const showcaseExamples: ShowcaseExample[] = yaml.parse(
  showcaseYamlFileContents,
);

export type ShowcaseExample = {
  name: string;
  description: string;
  link: string;
  imgSrc: string;
  videoSrc: string;
};
