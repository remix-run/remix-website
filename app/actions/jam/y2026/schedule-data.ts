import assert from "node:assert";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import * as s from "remix/data-schema";
import yaml from "yaml";
import { renderMarkdown } from "../../../data/markdown.ts";
import { memoizeAsync } from "../../../utils/memoize-async.ts";
import type { ScheduleItem } from "./public/schedule/schedule-types.ts";

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
    emoji: s.optional(s.string()),
    imgFilename: s.optional(s.string()),
    speakers: s.optional(s.array(speakerSchema)),
  }),
);

type ScheduleSource = s.InferOutput<typeof scheduleSchema>[number];
type SpeakerSource = s.InferOutput<typeof speakerSchema>;
type ImageUrlByFilename = Map<string, string>;

export const getJam2026Schedule = memoizeAsync(loadJam2026Schedule);

async function loadJam2026Schedule(): Promise<ScheduleItem[]> {
  let [source, imageEntries] = await Promise.all([
    readFile(SCHEDULE_FILE_PATH, "utf8"),
    readdir(SCHEDULE_IMAGES_DIRECTORY, { withFileTypes: true }),
  ]);
  let imageUrlByFilename: ImageUrlByFilename = new Map(
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
    schedule.map((item) => loadScheduleItem(item, imageUrlByFilename)),
  );
}

async function loadScheduleItem(
  item: ScheduleSource,
  imageUrlByFilename: ImageUrlByFilename,
): Promise<ScheduleItem> {
  let [{ html: description }, speakers] = await Promise.all([
    renderMarkdown(item.description),
    Promise.all(
      (item.speakers ?? []).map((speaker) =>
        loadSpeaker(speaker, imageUrlByFilename),
      ),
    ),
  ]);

  return {
    time: item.time,
    title: item.title,
    description,
    emoji: item.emoji,
    imgSrc: resolveImage(imageUrlByFilename, item.imgFilename, item.title),
    speakers,
  };
}

async function loadSpeaker(
  speaker: SpeakerSource,
  imageUrlByFilename: ImageUrlByFilename,
) {
  let imgSrc = resolveImage(
    imageUrlByFilename,
    speaker.imgFilename,
    speaker.name,
  );
  let bio = speaker.bio ? (await renderMarkdown(speaker.bio)).html : undefined;

  return { name: speaker.name, imgSrc, bio };
}

function resolveImage(
  imageUrlByFilename: ImageUrlByFilename,
  filename: string | undefined,
  owner: string,
) {
  if (!filename) return undefined;
  let src = imageUrlByFilename.get(filename);
  assert(src, `"${owner}" references missing schedule image "${filename}".`);
  return src;
}
