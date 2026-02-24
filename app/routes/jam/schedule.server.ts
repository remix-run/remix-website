import assert from "node:assert";
import yaml from "yaml";
import { processMarkdown } from "~/lib/md.server";
import * as s from "remix/data-schema";
import { LRUCache } from "lru-cache";

import scheduleYamlFileContents from "./data/schedule.yaml?raw";

const speakerImageModules = import.meta.glob(
  "./images/schedule/*.{png,jpg,jpeg,webp,avif}",
  { eager: true, query: "?url", import: "default" },
);

const imageUrlByKey = new Map(
  Object.entries(speakerImageModules).map(([path, url]) => {
    assert(
      typeof url === "string",
      `Speaker image "${path}" is not a string. Please check the schedule file.`,
    );
    let match = path.split("/").at(-1) ?? "";
    return [match, url];
  }),
);

const scheduleItemSchema = s.object({
  time: s.string(),
  title: s.string(),
  description: s.string(),
  speaker: s.string(),
  imgFilename: s.optional(s.string()),
  bio: s.optional(s.string()),
});

const scheduleArraySchema = s.array(scheduleItemSchema);

export function parseScheduleItems(raw: unknown) {
  return s.parse(scheduleArraySchema, raw);
}

type ScheduleItem = {
  time: string;
  title: string;
  description: string;
  speaker: string;
  imgSrc?: string;
  bio?: string;
};

function addNonBreakingSpaces(text: string): string {
  return text.replace(/Remix 3/g, "Remix\u00A03");
}

let cache = new LRUCache<string, ScheduleItem[]>({
  max: 250,
  maxSize: 1024 * 1024 * 12, // 12 mb
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

export async function getSchedule(): Promise<ScheduleItem[]> {
  const cached = cache.get("jam:schedule");
  if (cached) return cached;

  const rawUnknown = yaml.parse(scheduleYamlFileContents);
  const raw = parseScheduleItems(rawUnknown);

  const schedule: ScheduleItem[] = await Promise.all(
    raw.map(async (item) => {
      const [{ html: description }, { html: bio }] = await Promise.all([
        processMarkdown(item.description),
        processMarkdown(item.bio ?? ""),
      ]);

      let imgSrc: string | undefined;
      if (item.imgFilename) {
        imgSrc = imageUrlByKey.get(item.imgFilename);
        assert(
          imgSrc,
          `Speaker "${item.speaker}" has image filename "${item.imgFilename}" but no matching image file.`,
        );
      }

      return {
        time: item.time,
        title: addNonBreakingSpaces(item.title),
        description: addNonBreakingSpaces(description),
        speaker: item.speaker,
        imgSrc,
        bio: bio ? addNonBreakingSpaces(bio) : undefined,
      };
    }),
  );

  cache.set("jam:schedule", schedule);
  return schedule;
}
