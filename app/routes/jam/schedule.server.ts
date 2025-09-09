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

const imageUrlByKey = new Map(
  Object.entries(speakerImageModules).map(([path, url]) => {
    invariant(
      typeof url === "string",
      `Speaker image "${path}" is not a string. Please check the speakers file.`,
    );
    let match = path.split("/").at(-1) ?? "";
    return [match, url];
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
  description: z.string().optional(),
});

type Schedule = Array<
  | { type: "simple"; time: string; title: string; description: string }
  | {
      type: "talk";
      time: string;
      title: string;
      description: string;
      bio?: string;
      speakers: Array<{ name: string; imgSrc: string }>;
    }
>;

let cache = new LRUCache<string, Schedule>({
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

  return await Promise.all(
    raw.map(async (t) => {
      const [{ html: descriptionHTML }, { html: bio }] = await Promise.all([
        processMarkdown(t.description),
        processMarkdown(t.bio ?? ""),
      ]);
      return {
        title: t.title,
        description: descriptionHTML,
        bio: t.bio ? bio : undefined,
        speakers: t.speakers,
      } as const;
    }),
  );
}

async function loadScheduleRaw() {
  const rawUnknown = yaml.parse(scheduleYamlFileContents);
  return z.array(scheduleItemRawSchema).parse(rawUnknown);
}

export async function getSchedule(): Promise<Schedule> {
  const cached = cache.get("jam:schedule");
  if (cached) return cached;

  const [speakers, talks, scheduleRaw] = await Promise.all([
    loadSpeakers(),
    loadTalks(),
    loadScheduleRaw(),
  ]);

  const speakersByName = new Map(speakers.map((s) => [s.name, s]));
  const talksByTitle = new Map(talks.map((t) => [t.title, t]));

  const schedule: Schedule = await Promise.all(
    scheduleRaw.map(async (item) => {
      if (item.type === "talk") {
        const talk = talksByTitle.get(item.title);
        invariant(
          talk,
          `schedule item references talk "${item.title}" which does not exist`,
        );

        const speakersExpanded = talk.speakers.map((name) => {
          const speaker = speakersByName.get(name);
          invariant(
            speaker,
            `Talk "${talk.title}" references speaker "${name}" which does not exist`,
          );
          return speaker;
        });

        return {
          type: "talk" as const,
          time: item.time,
          title: item.title,
          description: talk.description,
          bio: talk.bio,
          speakers: speakersExpanded,
        };
      }

      const { html: description } = await processMarkdown(
        item.description ?? "",
      );
      return {
        type: "simple" as const,
        time: item.time,
        title: item.title,
        description,
      };
    }),
  );

  cache.set("jam:schedule", schedule);
  return schedule;
}
