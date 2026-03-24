import assert from "node:assert";
import { readdir } from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import * as s from "remix/data-schema";
import { LRUCache } from "lru-cache";
import { processMarkdown } from "../shared/lib/md.server";

import scheduleYamlFileContents from "../assets/jam/data/schedule.yaml?raw";

const SCHEDULE_IMAGES_DIRECTORY = path.join(
  process.cwd(),
  "public/jam/2025/images/schedule",
);
const SCHEDULE_IMAGE_PUBLIC_PREFIX = "/jam/2025/images/schedule";

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
  maxSize: 1024 * 1024 * 12,
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

let scheduleImageUrlByKeyPromise: Promise<Map<string, string>> | undefined;

export async function getSchedule(): Promise<ScheduleItem[]> {
  const cached = cache.get("jam:schedule");
  if (cached) return cached;

  const imageUrlByKey = await getScheduleImageUrlByKey();
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

async function getScheduleImageUrlByKey(): Promise<Map<string, string>> {
  if (!scheduleImageUrlByKeyPromise) {
    scheduleImageUrlByKeyPromise = loadScheduleImageUrlByKey();
  }
  return scheduleImageUrlByKeyPromise;
}

async function loadScheduleImageUrlByKey(): Promise<Map<string, string>> {
  let entries = await readdir(SCHEDULE_IMAGES_DIRECTORY, {
    withFileTypes: true,
  });

  return new Map(
    entries
      .filter(
        (entry) =>
          entry.isFile() && /\.(png|jpe?g|webp|avif)$/i.test(entry.name),
      )
      .map((entry) => [
        entry.name,
        `${SCHEDULE_IMAGE_PUBLIC_PREFIX}/${entry.name}`,
      ]),
  );
}
