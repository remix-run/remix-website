import LRUCache from "lru-cache";

let cache = new LRUCache<string, Speaker[]>({
  max: 250,
  maxSize: 1024 * 1024 * 12, // 12 mb
  ttl: 1000 * 60 * 60 * 24, // 24 hours
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

const SPEAKERS_CACHE_KEY = "speakers-2023";

export async function getSpeakers(
  opts: { noCache?: boolean } = {}
): Promise<Speaker[]> {
  let { noCache = false } = opts;
  if (!noCache) {
    let cached = cache.get(SPEAKERS_CACHE_KEY);
    if (cached) {
      return cached;
    }
  }

  let fetch = noCache ? fetchNoCache : fetchNaiveStaleWhileRevalidate;
  let fetched = await fetch(
    "https://sessionize.com/api/v2/s8ds2hnu/view/Speakers",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
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
          "Invalid speaker object; skipping.\n\nSee API settings to ensure expected data is included: https://sessionize.com/app/organizer/schedule/api/endpoint/9617/7818\n\n",
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

function modelSpeaker(speaker: SessionizeSpeakerData): Speaker {
  let id = String(speaker.id);
  let { nameFirst, nameLast, nameFull } = getSpeakerNames(speaker);
  let link = getSpeakerLink(speaker);
  let tagLine = getSpeakerTagLine(speaker);
  let imgUrl = speaker.profilePicture ? String(speaker.profilePicture) : null;
  let twitterHandle = link?.includes("twitter.com")
    ? "@" + getTwitterHandle(link)
    : null;
  let validatedSpeaker: Speaker = {
    id,
    tagLine,
    link,
    nameFirst,
    nameLast,
    nameFull,
    imgUrl,
    twitterHandle,
    isTopSpeaker: !!speaker.isTopSpeaker,
  };
  return validatedSpeaker;
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
  tagLine: string | null;
  link: string | null;
  imgUrl: string | null;
  twitterHandle: string | null;
  isTopSpeaker: boolean;
}

export interface SessionizeSpeakerData {
  id: number | string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  tagLine: string | null;
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
