import invariant from "tiny-invariant";
import yaml from "yaml";
import { processMarkdown } from "~/lib/md.server";
import { z } from "zod";
import { LRUCache } from "lru-cache";

import speakersYamlFileContents from "./data/speakers.yaml?raw";
import talksYamlFileContents from "./data/talks.yaml?raw";
import scheduleYamlFileContents from "./data/schedule.yaml?raw";

const speakerImageModules = import.meta.glob(
  "./images/speakers/*.{png,jpg,jpeg,webp,avif}",
  { eager: true, query: "?url", import: "default" },
);

function getFilename(path: string) {
  let match = path.split("/").at(-1);
  return match ?? "";
}

const imageUrlByKey = new Map(
  Object.entries(speakerImageModules).map(([path, url]) => {
    invariant(
      typeof url === "string",
      `Speaker image "${path}" is not a string. Please check the speakers file.`,
    );
    return [getFilename(path), url];
  }),
);

const speakerRawSchema = z.object({
  name: z.string(),
  imgFilename: z.string(),
});

const talkRawSchema = z.object({
  title: z.string(),
  description: z.string(),
  bio: z.string().optional(),
  speakers: z.array(z.string()),
});

const scheduleItemRawSchema = z.object({
  time: z.string(),
  title: z.string(),
  type: z.literal("talk").optional(),
  content: z.string().optional(),
});

const combinedDataSchema = z.object({
  speakers: z.array(z.object({ name: z.string(), imgSrc: z.string() })),
  talks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      descriptionHTML: z.string(),
      bio: z.string().optional(),
      bioHTML: z.string().optional(),
      speakers: z.array(z.string()),
    }),
  ),
  schedule: z.array(
    z.union([
      z.object({
        type: z.literal("simple"),
        time: z.string(),
        titleHTML: z.string(),
        contentHTML: z.string(),
      }),
      z.object({
        type: z.literal("talk"),
        time: z.string(),
        titleHTML: z.string(),
        contentHTML: z.string(),
        bioHTML: z.string().optional(),
        talkTitle: z.string(),
        speakers: z.array(z.object({ name: z.string(), imgSrc: z.string() })),
      }),
    ]),
  ),
});

type CombinedData = z.infer<typeof combinedDataSchema>;

let cache = new LRUCache<string, CombinedData>({
  max: 250,
  maxSize: 1024 * 1024 * 12, // 12 mb
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

async function loadSpeakers() {
  const rawUnknown = yaml.parse(speakersYamlFileContents);
  const raw = z.array(speakerRawSchema).parse(rawUnknown);
  return raw.map(({ name, imgFilename }) => {
    let imgSrc = imageUrlByKey.get(imgFilename);

    invariant(
      imgSrc,
      `Speaker "${name}" has no image. Please check the speakers file.`,
    );

    return { name, imgSrc };
  });
}

async function loadTalks() {
  const rawUnknown = yaml.parse(talksYamlFileContents);
  const raw = z.array(talkRawSchema).parse(rawUnknown);
  const talks: Array<{
    title: string;
    description: string;
    descriptionHTML: string;
    bio?: string;
    bioHTML?: string;
    speakers: Array<string>;
  }> = [];
  for (const t of raw) {
    const [{ html: descriptionHTML }, { html: bioHTML }] = await Promise.all([
      processMarkdown(t.description),
      processMarkdown(t.bio ?? ""),
    ]);
    talks.push({
      title: t.title,
      description: t.description,
      descriptionHTML,
      bio: t.bio,
      bioHTML: t.bio ? bioHTML : undefined,
      speakers: t.speakers,
    });
  }
  return talks;
}

async function loadScheduleRaw() {
  const rawUnknown = yaml.parse(scheduleYamlFileContents);
  return z.array(scheduleItemRawSchema).parse(rawUnknown);
}

export async function getSchedule(): Promise<CombinedData> {
  const cached = cache.get("jam:schedule");
  if (cached) return cached;

  const [speakers, talks, scheduleRaw] = await Promise.all([
    loadSpeakers(),
    loadTalks(),
    loadScheduleRaw(),
  ]);

  const speakersByName = new Map(speakers.map((s) => [s.name, s]));
  const talksByTitle = new Map(talks.map((t) => [t.title, t]));

  const schedule: CombinedData["schedule"] = [];

  for (const item of scheduleRaw) {
    if (item.type === "talk") {
      const talk = talksByTitle.get(item.title);
      invariant(
        talk,
        `schedule item references talk "${item.title}" which does not exist`,
      );

      const speakersExpanded = talk.speakers.map((name) => {
        const s = speakersByName.get(name);
        invariant(
          s,
          `Talk "${talk.title}" references speaker "${name}" which does not exist`,
        );
        return s;
      });

      const { html: titleHTML } = await processMarkdown(talk.title);

      schedule.push({
        type: "talk",
        time: item.time,
        titleHTML,
        contentHTML: talk.descriptionHTML,
        bioHTML: talk.bioHTML,
        talkTitle: talk.title,
        speakers: speakersExpanded,
      });
      continue;
    }

    const [{ html: titleHTML }, { html: contentHTML }] = await Promise.all([
      processMarkdown(item.title),
      processMarkdown(item.content ?? ""),
    ]);
    schedule.push({
      type: "simple",
      time: item.time,
      titleHTML,
      contentHTML,
    });
  }

  const result = combinedDataSchema.parse({ speakers, talks, schedule });
  cache.set("jam:schedule", result);
  return result;
}
