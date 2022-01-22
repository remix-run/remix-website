export type Speaker = {
  name: string;
  type: "emcee" | "regular";
  linkText: string;
  link: string;
  title: string;
  imgSrc: string;
  bio: string;
  slug: string;
};

export type Sponsor = {
  name: string;
  link: string;
  imgSrc: string;
  level: "premier" | "gold" | "silver" | "community";
};

export type Talk = {
  title: string;
  description: string;
  time: string;
  speakers: Array<string>;
};

export function isSpeaker(obj: any): obj is Speaker {
  return (
    typeof obj === "object" &&
    obj.name &&
    obj.title &&
    obj.imgSrc &&
    obj.linkText &&
    obj.link &&
    obj.bio &&
    (obj.type === "emcee" || obj.type === "regular")
  );
}

export function isSponsor(obj: any): obj is Sponsor {
  return (
    typeof obj === "object" &&
    obj.name &&
    obj.link &&
    obj.imgSrc &&
    ["premier", "gold", "silver", "community"].includes(obj.level)
  );
}

export function isTalk(obj: any): obj is Talk {
  return (
    typeof obj === "object" &&
    obj.title &&
    obj.description &&
    Array.isArray(obj.speakers) &&
    obj.speakers.every((item: any) => typeof item === "string")
  );
}

export function isSpeakerArray(arr: any): arr is Array<Speaker> {
  return Array.isArray(arr) && arr.every(isSpeaker);
}

export function isSponsorArray(arr: any): arr is Array<Sponsor> {
  return Array.isArray(arr) && arr.every(isSponsor);
}

export function isTalkArray(arr: any): arr is Array<Talk> {
  return Array.isArray(arr) && arr.every(isTalk);
}
