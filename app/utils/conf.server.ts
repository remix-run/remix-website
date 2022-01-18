import fsp from "fs/promises";
import path from "path";
import invariant from "ts-invariant";

import yaml from "yaml";
import LRUCache from "lru-cache";

export type Speaker = {
  nameFirst: string;
  nameLast: string;
  linkText: string;
  link: string;
  title: string;
  imgSrc: string;
};

export type Sponsor = {
  name: string;
  link: string;
  imgSrc: string;
  level: "premier" | "gold" | "silver" | "community";
};

let cache = new LRUCache<string, Array<Speaker> | Array<Sponsor>>({
  max: 1024 * 1024 * 12, // 12 mb
  length(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

let DATA_DIR = path.join(process.cwd(), "data");
let CONF_DIR = path.join(DATA_DIR, "conf");
let SPEAKERS_FILE = path.join(CONF_DIR, "speakers.yaml");
let SPONSORS_FILE = path.join(CONF_DIR, "sponsors.yaml");

export async function getSpeakers() {
  let cached = cache.get("speakers");
  if (isSpeakerArray(cached)) {
    return cached;
  }

  let speakersFileContents = await fsp.readFile(SPEAKERS_FILE, "utf8");
  let speakersRaw = yaml.parse(speakersFileContents);
  let speakers: Array<Speaker> = [];
  for (const speakerRaw of speakersRaw) {
    invariant(
      isSpeaker(speakerRaw),
      `Speaker ${JSON.stringify(
        speakerRaw
      )} is not valid. Please check the speakers file.`
    );
    speakers.push(speakerRaw);
  }
  cache.set("speakers", speakers);

  return speakers;
}

export async function getSponsors() {
  let cached = cache.get("sponsors");
  if (isSponsorArray(cached)) {
    return cached;
  }

  let sponsorsFileContents = await fsp.readFile(SPONSORS_FILE, "utf8");
  let sponsorsRaw = yaml.parse(sponsorsFileContents);
  let sponsors: Array<Sponsor> = [];
  for (const sponsorRaw of sponsorsRaw) {
    invariant(
      isSponsor(sponsorRaw),
      `Sponsor ${JSON.stringify(
        sponsorRaw
      )} is not valid. Please check the sponsors file.`
    );
    sponsors.push(sponsorRaw);
  }
  cache.set("sponsors", sponsors);

  return sponsors;
}

export function isSpeaker(obj: any): obj is Speaker {
  return (
    typeof obj === "object" &&
    obj.nameFirst &&
    obj.nameLast &&
    obj.title &&
    obj.imgSrc &&
    obj.linkText &&
    obj.link
  );
}

export function isSponsor(obj: any): obj is Sponsor {
  return (
    typeof obj === "object" &&
    obj.name &&
    obj.link &&
    obj.imgSrc &&
    ["premier", "gold", "silver", "community"].includes(obj.level)
  );
}

function isSpeakerArray(arr: any): arr is Array<Speaker> {
  return Array.isArray(arr) && arr.every(isSpeaker);
}

function isSponsorArray(arr: any): arr is Array<Sponsor> {
  return Array.isArray(arr) && arr.every(isSponsor);
}
