import assert from "node:assert";
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import * as s from "remix/data-schema";
import { renderMarkdown } from "../../../data/markdown.ts";
import { memoizeAsync } from "../../../utils/memoize-async.ts";

const SCHEDULE_IMAGES_DIRECTORY = path.join(
  process.cwd(),
  "public/jam/2025/images/schedule",
);
const SCHEDULE_IMAGE_PUBLIC_PREFIX = "/jam/2025/images/schedule";
const SCHEDULE_FILE_PATH = path.join(
  process.cwd(),
  "data/jam-schedule-2025.yaml",
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

function parseScheduleItems(raw: unknown) {
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

export const getJam2025Schedule = memoizeAsync(loadJam2025Schedule);

async function loadJam2025Schedule(): Promise<ScheduleItem[]> {
  let imageUrlByKey = await getScheduleImageUrlByKey();
  let rawUnknown = yaml.parse(readFileSync(SCHEDULE_FILE_PATH, "utf8"));
  let raw = parseScheduleItems(rawUnknown);

  return Promise.all(
    raw.map(async (item) => {
      let [{ html: description }, { html: bio }] = await Promise.all([
        renderMarkdown(item.description),
        renderMarkdown(item.bio ?? ""),
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
}

const getScheduleImageUrlByKey = memoizeAsync(loadScheduleImageUrlByKey);

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
