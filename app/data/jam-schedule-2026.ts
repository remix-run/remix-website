import assert from "node:assert";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import * as s from "remix/data-schema";
import yaml from "yaml";
import { processMarkdown } from "./md.ts";

const SCHEDULE_IMAGES_DIRECTORY = path.join(
  process.cwd(),
  "public/jam/2026/images/schedule",
);
const SCHEDULE_IMAGE_PUBLIC_PREFIX = "/jam/2026/images/schedule";
const SCHEDULE_FILE_PATH = path.join(
  process.cwd(),
  "data/jam-schedule-2026.yaml",
);

const speakerSchema = s.object({
  name: s.string(),
  imgFilename: s.optional(s.string()),
  bio: s.optional(s.string()),
});

const scheduleSchema = s.array(
  s.object({
    time: s.string(),
    title: s.string(),
    description: s.string(),
    speakers: s.array(speakerSchema),
  }),
);

type Jam2026ScheduleItem = {
  time: string;
  title: string;
  description: string;
  speakers: {
    name: string;
    imgSrc?: string;
    bio?: string;
  }[];
};

let schedulePromise: Promise<Jam2026ScheduleItem[]> | undefined;

export function getJam2026Schedule(): Promise<Jam2026ScheduleItem[]> {
  schedulePromise ??= loadJam2026Schedule();
  return schedulePromise;
}

async function loadJam2026Schedule(): Promise<Jam2026ScheduleItem[]> {
  let [source, imageEntries] = await Promise.all([
    readFile(SCHEDULE_FILE_PATH, "utf8"),
    readdir(SCHEDULE_IMAGES_DIRECTORY, { withFileTypes: true }),
  ]);
  let imageUrlByFilename = new Map(
    imageEntries
      .filter(
        (entry) =>
          entry.isFile() && /\.(png|jpe?g|webp|avif)$/i.test(entry.name),
      )
      .map((entry) => [
        entry.name,
        `${SCHEDULE_IMAGE_PUBLIC_PREFIX}/${entry.name}`,
      ]),
  );
  let schedule = s.parse(scheduleSchema, yaml.parse(source));

  return Promise.all(
    schedule.map(async (item) => {
      let [{ html: description }, speakers] = await Promise.all([
        processMarkdown(item.description),
        Promise.all(
          item.speakers.map(async (speaker) => {
            let imgSrc = speaker.imgFilename
              ? imageUrlByFilename.get(speaker.imgFilename)
              : undefined;

            if (speaker.imgFilename) {
              assert(
                imgSrc,
                `Speaker "${speaker.name}" has image filename "${speaker.imgFilename}" but no matching image file.`,
              );
            }

            let bio = speaker.bio
              ? (await processMarkdown(speaker.bio)).html
              : undefined;

            return { name: speaker.name, imgSrc, bio };
          }),
        ),
      ]);

      return {
        time: item.time,
        title: item.title,
        description,
        speakers,
      };
    }),
  );
}
