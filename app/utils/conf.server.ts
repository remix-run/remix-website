import fsp from "fs/promises";
import path from "path";
import invariant from "ts-invariant";
import { processMarkdown } from "@ryanflorence/md";

import yaml from "yaml";
import LRUCache from "lru-cache";
import {
  isScheduleItemArray,
  isScheduleItemRaw,
  isScheduleItemRawWithSpeakers,
  isSimpleScheduleItemRaw,
  isSpeaker,
  isSpeakerArray,
  isSponsor,
  isSponsorArray,
  isTalk,
  isTalkArray,
  isTalkScheduleItemRaw,
  ScheduleItem,
  ScheduleItemSpeaker,
  sluggify,
  Speaker,
  Sponsor,
  Talk,
} from "./conf";

let cache = new LRUCache<
  string,
  Array<Speaker> | Array<Sponsor> | Array<Talk> | Array<ScheduleItem>
>({
  max: 1024 * 1024 * 12, // 12 mb
  length(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

const DATA_DIR = path.join(process.cwd(), "data");
const CONF_ROOT_DIR = path.join(DATA_DIR, "conf");

function getConfPaths(year: ConfYear) {
  let confDir = path.join(CONF_ROOT_DIR, String(year));
  return {
    speakersFile: path.join(confDir, "speakers.yaml"),
    sponsorsFile: path.join(confDir, "sponsors.yaml"),
    talksFile: path.join(confDir, "talks.yaml"),
    scheduleFile: path.join(confDir, "schedule.yaml"),
  };
}

type ConfYear = 2022 | 2023;

export async function getSpeakers(year: ConfYear) {
  let cached = cache.get(`speakers-${year}`);
  if (isSpeakerArray(cached)) {
    return cached;
  }

  let { speakersFile: SPEAKERS_FILE } = getConfPaths(year);
  let speakersFileContents = await fsp.readFile(SPEAKERS_FILE, "utf8");
  let speakersRaw = yaml.parse(speakersFileContents);
  let speakers: Array<Speaker> = [];
  for (let speakerRaw of speakersRaw) {
    let speakerRawWithDefaults = {
      bioHTML: await processMarkdown(speakerRaw.bio),
      type: "speaker",
      slug: sluggify(speakerRaw.name),
      ...speakerRaw,
    };
    invariant(
      isSpeaker(speakerRawWithDefaults),
      `Speaker ${JSON.stringify(
        speakerRaw
      )} is not valid. Please check the speakers file.`
    );
    speakers.push({
      ...speakerRawWithDefaults,
    });
  }
  cache.set("speakers", speakers);

  return speakers;
}

export async function getSponsors(year: ConfYear) {
  let cached = cache.get(`sponsors-${year}`);
  if (isSponsorArray(cached)) {
    return cached;
  }

  let { sponsorsFile: SPONSORS_FILE } = getConfPaths(year);
  let sponsorsFileContents = await fsp.readFile(SPONSORS_FILE, "utf8");
  let sponsorsRaw = yaml.parse(sponsorsFileContents);
  let sponsors: Array<Sponsor> = [];
  for (let sponsorRaw of sponsorsRaw) {
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

export async function getTalks(year: ConfYear) {
  let cached = cache.get(`talks-${year}`);
  if (isTalkArray(cached)) {
    return cached;
  }

  let { talksFile: TALKS_FILE } = getConfPaths(year);
  let talksFileContents = await fsp.readFile(TALKS_FILE, "utf8");
  let talksRaw = yaml.parse(talksFileContents);
  let talks: Array<Talk> = [];
  for (let talkRaw of talksRaw) {
    invariant(
      isTalk(talkRaw),
      `Talk ${JSON.stringify(
        talkRaw
      )} is not valid. Please check the talks file.`
    );
    talks.push({
      ...talkRaw,
      descriptionHTML: await processMarkdown(talkRaw.description),
    });
  }
  cache.set("talks", talks);

  return talks;
}

export async function getSchedule(year: ConfYear) {
  let cached = cache.get(`schedule-${year}`);
  if (isScheduleItemArray(cached)) {
    return cached;
  }

  let { scheduleFile: SCHEDULE_FILE } = getConfPaths(year);
  let allTalks = await getTalks(year);
  let allSpeakers = await getSpeakers(year);

  let schedulesFileContents = await fsp.readFile(SCHEDULE_FILE, "utf8");
  let scheduleItemsRaw = yaml.parse(schedulesFileContents);
  let scheduleItems: Array<ScheduleItem> = [];

  for (let scheduleItemRaw of scheduleItemsRaw) {
    function getSpeakersByName(speakers: Array<string>) {
      return speakers.map((s) => {
        let speaker = allSpeakers.find((speaker) => speaker.name === s);
        invariant(
          speaker,
          `Speaker ${s} is not valid in ${JSON.stringify(
            scheduleItemRaw
          )}. Please check the schedules file.`
        );
        return {
          slug: speaker.slug,
          name: speaker.name,
          imgSrc: speaker.imgSrc,
        };
      });
    }
    invariant(
      isScheduleItemRaw(scheduleItemRaw),
      `schedule item ${JSON.stringify(
        scheduleItemRaw
      )} is not valid. Please check the schedules file.`
    );
    if (isSimpleScheduleItemRaw(scheduleItemRaw)) {
      let speakers: Array<ScheduleItemSpeaker> = [];
      if (isScheduleItemRawWithSpeakers(scheduleItemRaw)) {
        speakers = getSpeakersByName(scheduleItemRaw.speakers);
      }
      scheduleItems.push({
        time: scheduleItemRaw.time,
        titleHTML: await processMarkdown(scheduleItemRaw.title),
        contentHTML: await processMarkdown(scheduleItemRaw.content),
        speakers,
      });
    } else if (isTalkScheduleItemRaw(scheduleItemRaw)) {
      let talk = allTalks.find((talk) => talk.title === scheduleItemRaw.talk);
      invariant(
        talk,
        `schedule item ${JSON.stringify(scheduleItemRaw)} references talk ${
          scheduleItemRaw.talk
        } which does not exist.`
      );
      invariant(
        talk.time === scheduleItemRaw.time,
        `Talk time is set to "${
          talk.time
        }" but that is not the time that is set in the scheduled item (${
          scheduleItemRaw.time
        }) for ${JSON.stringify(scheduleItemRaw)}`
      );
      scheduleItems.push({
        time: scheduleItemRaw.time,
        titleHTML: await processMarkdown(
          talk.type === "lightning"
            ? `<span title="Lightning talk">⚡</span> ${talk.title}`
            : talk.title
        ),
        contentHTML: await processMarkdown(
          talk.description.length > 400
            ? `${talk.description.slice(0, 297).trim()}...`
            : talk.description
        ),
        speakers: getSpeakersByName(talk.speakers),
      });
    }
  }
  cache.set("schedules", scheduleItems);

  return scheduleItems;
}
