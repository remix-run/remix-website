import fsp from "fs/promises";
import path from "path";
import invariant from "ts-invariant";
import { processMarkdown } from "@ryanflorence/md";

import yaml from "yaml";
import LRUCache from "lru-cache";
import {
  isSpeaker,
  isSpeakerArray,
  isSponsor,
  isSponsorArray,
  isTalk,
  isTalkArray,
  Speaker,
  Sponsor,
  Talk,
} from "./conf";

let cache = new LRUCache<string, Array<Speaker> | Array<Sponsor> | Array<Talk>>(
  {
    max: 1024 * 1024 * 12, // 12 mb
    length(value, key) {
      return JSON.stringify(value).length + (key ? key.length : 0);
    },
  }
);

let DATA_DIR = path.join(process.cwd(), "data");
let CONF_DIR = path.join(DATA_DIR, "conf");
let SPEAKERS_FILE = path.join(CONF_DIR, "speakers.yaml");
let SPONSORS_FILE = path.join(CONF_DIR, "sponsors.yaml");
let TALKS_FILE = path.join(CONF_DIR, "talks.yaml");

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
    speakers.push({
      ...speakerRaw,
      slug:
        speakerRaw.slug ||
        speakerRaw.name
          .toLowerCase()
          .replace(/[ .']/g, " ")
          .split(" ")
          .filter(Boolean)
          .join("-"),
      bio: await processMarkdown(speakerRaw.bio),
    });
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

export async function getTalks() {
  let cached = cache.get("talks");
  if (isTalkArray(cached)) {
    return cached;
  }

  let talksFileContents = await fsp.readFile(TALKS_FILE, "utf8");
  let talksRaw = yaml.parse(talksFileContents);
  let talks: Array<Talk> = [];
  for (const talkRaw of talksRaw) {
    invariant(
      isTalk(talkRaw),
      `Talk ${JSON.stringify(
        talkRaw
      )} is not valid. Please check the talks file.`
    );
    talks.push(talkRaw);
  }
  cache.set("talks", talks);

  return talks;
}
