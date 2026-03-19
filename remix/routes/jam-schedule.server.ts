import assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import yaml from "yaml";
import * as s from "remix/data-schema";
import { LRUCache } from "lru-cache";
import { processMarkdown } from "../shared/lib/md.server";
import { getRepoRoot } from "../utils/repo-root.server.ts";

let scheduleYamlFileContents = fs.readFileSync(
  path.join(getRepoRoot(), "remix/assets/jam/data/schedule.yaml"),
  "utf8",
);

let scheduleImagesDir = path.join(
  getRepoRoot(),
  "remix/assets/jam/images/schedule",
);

const imageUrlByKey = new Map<string, string>();
if (fs.existsSync(scheduleImagesDir)) {
  for (let name of fs.readdirSync(scheduleImagesDir)) {
    imageUrlByKey.set(name, `/assets/jam/images/schedule/${name}`);
  }
}

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
