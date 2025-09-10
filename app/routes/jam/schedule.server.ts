import invariant from "tiny-invariant";
import yaml from "yaml";
import { processMarkdown } from "~/lib/md.server";
import { z } from "zod";
import { LRUCache } from "lru-cache";

import scheduleYamlFileContents from "./data/schedule.yaml?raw";

const speakerImageModules = import.meta.glob(
  "./images/speakers/*.{png,jpg,jpeg,webp,avif}",
  { eager: true, query: "?url", import: "default" },
);

const imageUrlByKey = new Map(
  Object.entries(speakerImageModules).map(([path, url]) => {
    invariant(
      typeof url === "string",
      `Speaker image "${path}" is not a string. Please check the schedule file.`,
    );
    let match = path.split("/").at(-1) ?? "";
    return [match, url];
  }),
);

const scheduleItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string(),
  speaker: z.string(),
  imgFilename: z.string().optional(),
  bio: z.string().optional(),
});

type ScheduleItem = {
  time: string;
  title: string;
  description: string;
  speaker: string;
  imgSrc?: string;
  bio?: string;
};

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
  const raw = z.array(scheduleItemSchema).parse(rawUnknown);

  const schedule: ScheduleItem[] = await Promise.all(
    raw.map(async (item) => {
      const [{ html: description }, { html: bio }] = await Promise.all([
        processMarkdown(item.description),
        processMarkdown(item.bio ?? ""),
      ]);

      let imgSrc: string | undefined;
      if (item.imgFilename) {
        imgSrc = imageUrlByKey.get(item.imgFilename);
        invariant(
          imgSrc,
          `Speaker "${item.speaker}" has image filename "${item.imgFilename}" but no matching image file.`,
        );
      }

      return {
        time: item.time,
        title: item.title,
        description,
        speaker: item.speaker,
        imgSrc,
        bio: bio || undefined,
      };
    }),
  );

  cache.set("jam:schedule", schedule);
  return schedule;
}
