import LRUCache from "lru-cache";

const NO_CACHE =
  process.env.NO_CACHE != null ? process.env.NO_CACHE === "true" : undefined;
const SPEAKERS_CACHE_KEY = "speakers";
const SESSIONS_CACHE_KEY = "sessions";
const SESSIONIZE_ENDPOINT = "https://sessionize.com/api/v2/s8ds2hnu";
const SESSIONIZE_API_DETAILS_URL =
  "https://sessionize.com/app/organizer/schedule/api/endpoint/9617/7818";

let cache = new LRUCache<"speakers" | "sessions", (Speaker | SpeakerSession)[]>(
  {
    max: 250,
    maxSize: 1024 * 1024 * 12, // 12 mb
    ttl: 1000 * 60 * 60 * 24, // 24 hours
    sizeCalculation(value, key) {
      return JSON.stringify(value).length + (key ? key.length : 0);
    },
  }
);

export async function getSpeakers(
  opts: { noCache?: boolean } = {}
): Promise<Speaker[]> {
  let { noCache = NO_CACHE ?? false } = opts;
  if (!noCache) {
    let cached = cache.get(SPEAKERS_CACHE_KEY);
    if (cached) {
      return cached as Speaker[];
    }
  }

  let fetch = noCache ? fetchNoCache : fetchNaiveStaleWhileRevalidate;
  let fetched = await fetch(`${SESSIONIZE_ENDPOINT}/view/Speakers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!fetched.ok) {
    throw new Error(
      "Error fetching speakers, responded with status: " + fetched.status
    );
  }
  let json: unknown = await fetched.json();
  if (!json || !Array.isArray(json)) {
    throw new Error(
      "Error fetching speakers. Expected an array, received:\n\n" + json
    );
  }

  let speakers = json
    .map((speaker: unknown) => {
      try {
        validateSessionizeSpeakerData(speaker);
      } catch (error) {
        console.warn(
          `Invalid speaker object; skipping.\n\nSee API settings to ensure expected data is included: ${SESSIONIZE_API_DETAILS_URL}\n\n`,
          "Received:\n",
          speaker
        );
        return null;
      }
      return modelSpeaker(speaker);
    })
    .filter(isNotEmpty);

  if (!noCache) {
    cache.set(SPEAKERS_CACHE_KEY, speakers);
  }
  return speakers;
}

export async function getSpeakerSessions(
  opts: { noCache?: boolean } = {}
): Promise<SpeakerSession[]> {
  let { noCache = NO_CACHE ?? false } = opts;
  if (!noCache) {
    let cached = cache.get(SESSIONS_CACHE_KEY);
    if (cached) {
      return cached as SpeakerSession[];
    }
  }

  let fetch = noCache ? fetchNoCache : fetchNaiveStaleWhileRevalidate;
  let fetched = await fetch(`${SESSIONIZE_ENDPOINT}/view/Sessions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!fetched.ok) {
    throw new Error(
      "Error fetching speakers, responded with status: " + fetched.status
    );
  }
  let json: unknown = await fetched.json();
  if (!json || !Array.isArray(json)) {
    throw new Error(
      "Error fetching speakers. Expected an array, received:\n\n" + json
    );
  }

  let sessions = json
    .flatMap((sessionGroup: unknown) => {
      try {
        if (
          !sessionGroup ||
          typeof sessionGroup !== "object" ||
          !("sessions" in sessionGroup) ||
          !Array.isArray(sessionGroup.sessions)
        ) {
          throw null;
        }

        let flatSessions = new Map<string | number, SpeakerSession>();
        for (let session of sessionGroup.sessions) {
          validateSessionizeSessionData(session);
          if (flatSessions.has(session.id)) continue;
          flatSessions.set(session.id, modelSpeakerSession(session));
        }
        return Array.from(flatSessions.values());
      } catch (error) {
        return null;
      }
    })
    .filter(isNotEmpty);

  if (!noCache) {
    cache.set(SESSIONS_CACHE_KEY, sessions);
  }
  return sessions;
}

export async function getSchedule(): Promise<Schedule[]> {
  let [fetched, speakers] = await Promise.all([
    fetch(`${SESSIONIZE_ENDPOINT}/view/GridSmart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }),
    getSpeakers(),
  ]);
  if (!fetched.ok) {
    throw new Error(
      "Error fetching schedule, responded with status: " + fetched.status
    );
  }
  let json = await fetched.json();
  if (!json || !Array.isArray(json)) {
    throw new Error(
      "Error fetching schedule. Expected an array, received:\n\n" + json
    );
  }

  let schedule = json
    .map((dailySchedule: unknown) => {
      try {
        if (
          !dailySchedule ||
          typeof dailySchedule !== "object" ||
          !("date" in dailySchedule) ||
          typeof dailySchedule.date !== "string" ||
          !("rooms" in dailySchedule) ||
          !("timeSlots" in dailySchedule) ||
          !Array.isArray(dailySchedule.rooms) ||
          !Array.isArray(dailySchedule.timeSlots)
        ) {
          throw null;
        }

        let schedule: Schedule = {
          date: new Date(dailySchedule.date),
          sessions: dailySchedule.timeSlots
            .flatMap(
              (timeSlot: {
                rooms: Array<{
                  name: string;
                  session: {
                    id: string;
                    title: string;
                    description: string | null;
                    startsAt: string;
                    endsAt: string;
                    speakers: Array<{
                      id: string;
                      name: string;
                    }>;
                  };
                }>;
              }) => {
                return timeSlot.rooms.flatMap<ScheduleSession>((room) => {
                  let session = room.session;
                  let sessionSpeakers = session.speakers.map((speaker) => {
                    let found = speakers.find((s) => s.id === speaker.id);
                    let sessionSpeaker: ScheduleSession["speakers"][number] = {
                      id: speaker.id,
                      nameFirst: found?.nameFirst ?? null,
                      nameLast: found?.nameLast ?? null,
                      nameFull: found?.nameFull ?? speaker.name,
                      imgUrl:
                        sessionSpeakers.find((s) => s.id === speaker.id)
                          ?.imgUrl || null,
                    };
                    return sessionSpeaker;
                  });
                  return {
                    id: session.id,
                    room: room.name,
                    title: session.title.startsWith("Registration")
                      ? "Registration"
                      : session.title,
                    description: session.description,
                    startsAt: new Date(session.startsAt),
                    endsAt: new Date(session.endsAt),
                    speakers: sessionSpeakers,
                  };
                });
              }
            )
            .sort((a, b) => {
              let isEariler = a.startsAt < b.startsAt;
              let isLater = a.startsAt > b.startsAt;
              let isRegistration =
                a.title === "Registration" && b.title !== "Registration";
              return isEariler ? -1 : isLater ? 1 : isRegistration ? -1 : 0;
            }),
        };

        return schedule;

        // let flatSessions = new Map();
        // for (let session of scheduleGroup.sessions) {
        //   validateSessionizeSessionData(session);
        //   if (flatSessions.has(session.id)) continue;
        //   flatSessions.set(session.id, modelSpeakerSession(session));
        // }
        // return Array.from(flatSessions.values());
      } catch (error) {
        return null;
      }
    })
    .filter(isNotEmpty);

  return schedule.sort((a, b) => {
    let isEariler = a.date < b.date;
    let isLater = a.date > b.date;
    return isEariler ? -1 : isLater ? 1 : 0;
  });
}

function modelSpeaker(speaker: SessionizeSpeakerData): Speaker {
  let id = String(speaker.id);
  let { nameFirst, nameLast, nameFull } = getSpeakerNames(speaker);
  let link = getSpeakerLink(speaker);
  let tagLine = getSpeakerTagLine(speaker);
  let imgUrl = speaker.profilePicture ? String(speaker.profilePicture) : null;
  let twitterHandle = link?.includes("twitter.com")
    ? "@" + getTwitterHandle(link)
    : null;
  let bio = speaker.bio
    ? speaker.bio
        .split(/[\r\n]+/g)
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n")
    : null;
  let validatedSpeaker: Speaker = {
    id,
    tagLine,
    link,
    bio,
    nameFirst,
    nameLast,
    nameFull,
    imgUrl,
    twitterHandle,
    isTopSpeaker: !!speaker.isTopSpeaker,
  };
  return validatedSpeaker;
}

function modelSpeakerSession(session: SessionizeSessionData): SpeakerSession {
  let id = String(session.id);
  let title = String(session.title).trim();
  let description = session.description
    ? String(session.description).trim()
    : null;
  let startsAt = session.startsAt ? new Date(session.startsAt) : null;
  let endsAt = session.endsAt ? new Date(session.endsAt) : null;
  let speakers =
    session.speakers && Array.isArray(session.speakers)
      ? session.speakers.map((speaker) => {
          return { id: String(speaker.id), name: String(speaker.name) };
        })
      : [];
  return {
    id,
    title,
    description,
    startsAt,
    endsAt,
    speakers,
  };
}

function getSpeakerNames(speaker: SessionizeSpeakerData) {
  let preferredName = speaker.questionAnswers?.find(
    (qa) => qa.question === "Preferred Name"
  )?.answer;
  let nameFirst: string;
  let nameLast = speaker.lastName ? String(speaker.lastName).trim() : "";
  if (preferredName) {
    nameFirst = preferredName.includes(nameLast)
      ? preferredName.slice(0, preferredName.indexOf(nameLast)).trim()
      : preferredName.trim();
  } else {
    nameFirst = speaker.firstName ? String(speaker.firstName).trim() : "";
  }
  let nameFull = [nameFirst, nameLast].filter(Boolean).join(" ");

  return {
    nameFirst,
    nameLast,
    nameFull,
    preferredName,
  };
}

function getSpeakerLink(speaker: SessionizeSpeakerData) {
  type LinkType = "Twitter" | "LinkedIn" | "Blog" | "Company_Website";
  let links: Partial<Record<LinkType, string>> = {};
  for (let link of speaker.links || []) {
    links[link.linkType] = link.url;
  }
  return (
    links["Twitter"] ||
    links["Blog"] ||
    links["LinkedIn"] ||
    links["Company_Website"] ||
    null
  );
}

function getSpeakerTagLine(speaker: SessionizeSpeakerData) {
  if (speaker.tagLine) {
    return speaker.tagLine.trim();
  }
  let jobTitle: string | undefined | null;
  if (
    (jobTitle = speaker.questionAnswers?.find(
      (qa) => qa.question === "Current Job Title"
    )?.answer)
  ) {
    return jobTitle.trim();
  }
  return null;
}

function getTwitterHandle(url: string) {
  let match = url.match(/twitter\.com\/([^/]+)/);
  return match?.[1] || null;
}

function isNotEmpty<T>(value: T | null | undefined): value is T {
  return value != null;
}

async function fetchNoCache(url: string, opts?: RequestInit) {
  return fetch(url, {
    ...opts,
    cache: "no-cache",
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/Request/cache#examples
async function fetchNaiveStaleWhileRevalidate(
  url: string,
  opts?: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers: HeadersInit;
  }
) {
  let method = opts?.method || "GET";
  let headers = opts?.headers || {};
  let controller = new AbortController();
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      cache: "only-if-cached",
      signal: controller.signal,
    });
  } catch (err) {
    // Workaround for Chrome, which fails with a TypeError
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      return fetchWithForceCache();
    }
    throw err;
  }
  if (res.status === 504) {
    return fetchWithForceCache();
  }

  let date = res.headers.get("date");
  let dt = date ? new Date(date).getTime() : 0;
  if (dt < Date.now() - 60 * 60 * 24) {
    // If older than 24 hours
    controller.abort();
    controller = new AbortController();
    return fetch(url, {
      method,
      headers,
      cache: "reload",
      signal: controller.signal,
    });
  }

  if (dt < Date.now() - 60 * 60 * 24 * 7) {
    // If it's older than 1 week, fetch but don't wait for it. We'll return the
    // stale value while this call "revalidates"
    fetch(url, {
      method,
      headers,
      cache: "no-cache",
    });
  }

  // return possibly stale value
  return res;

  function fetchWithForceCache() {
    controller.abort();
    controller = new AbortController();
    return fetch(url, {
      method,
      headers,
      cache: "force-cache",
      signal: controller.signal,
    });
  }
}

export interface Speaker {
  id: string;
  nameFirst: string;
  nameLast: string;
  nameFull: string;
  bio: string | null;
  tagLine: string | null;
  link: string | null;
  imgUrl: string | null;
  twitterHandle: string | null;
  isTopSpeaker: boolean;
}

export interface SpeakerSession {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  speakers: Array<{ id: string; name: string }>;
}

interface ScheduleSession {
  id: string;
  room: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date;
  speakers: Array<{
    id: string;
    nameFirst: string | null;
    nameLast: string | null;
    nameFull: string;
    imgUrl: string | null;
  }>;
}

export interface Schedule {
  date: Date;
  sessions: ScheduleSession[];
}

export interface SessionizeSpeakerData {
  id: number | string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  tagLine: string | null;
  bio: string | null;
  links: Array<{
    title: string;
    linkType: "Twitter" | "LinkedIn" | "Blog" | "Company_Website";
    url: string;
  }> | null;
  questionAnswers: Array<{
    question: string;
    answer: string | null;
  }> | null;
  profilePicture: string | null;
  isTopSpeaker: boolean;
}

export interface SessionizeSessionData {
  id: number | string;
  title: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isServiceSession: boolean;
  isPlenumSession: boolean;
  speakers: Array<{ id: string; name: string }>;
  categories: Array<{
    id: string;
    name: string;
    categoryItems: Array<{ id: string; name: string }>;
  }>;
  roomId: number | null;
  room: string | null;
  status: string;
}

function validateSessionizeSpeakerData(
  data: unknown
): asserts data is SessionizeSpeakerData {
  if (
    data == null ||
    typeof data !== "object" ||
    !("id" in data) ||
    !("firstName" in data) ||
    !("lastName" in data) ||
    !("fullName" in data) ||
    !("tagLine" in data) ||
    !("links" in data) ||
    !("questionAnswers" in data) ||
    !("profilePicture" in data) ||
    !("isTopSpeaker" in data) ||
    (data.links != null && !Array.isArray(data.links)) ||
    (data.questionAnswers != null && !Array.isArray(data.questionAnswers))
  ) {
    throw new Error("Invalid speaker data");
  }
}

function validateSessionizeSessionData(
  data: unknown
): asserts data is SessionizeSessionData {
  if (
    data == null ||
    typeof data !== "object" ||
    !("id" in data)
    // !("title" in data) ||
    // !("description" in data) ||
    // !("startsAt" in data) ||
    // !("endsAt" in data)
    // TODO: ...
  ) {
    throw new Error("Invalid session data");
  }
}
