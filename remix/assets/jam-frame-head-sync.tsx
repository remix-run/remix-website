import { clientEntry, type Handle } from "remix/component";
import assets from "./jam-frame-head-sync.tsx?assets=client";

type HeadProps = {
  title: string;
  description: string;
  pageUrl: string;
  previewImage: string;
};

let META_FIELDS = [
  ["name", "description"],
  ["property", "og:type"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:url"],
  ["property", "og:image"],
  ["name", "twitter:card"],
  ["name", "twitter:title"],
  ["name", "twitter:description"],
  ["name", "twitter:image"],
] as const;

export let JamFrameHeadSync = clientEntry(
  `${assets.entry}#JamFrameHeadSync`,
  (handle: Handle) => {
    let latestProps: HeadProps | null = null;
    let isQueued = false;

    let sync = () => {
      isQueued = false;
      if (!latestProps) return;

      syncTitle(latestProps.title);
      syncMeta("name", "description", latestProps.description);
      syncMeta("property", "og:type", "website");
      syncMeta("property", "og:title", latestProps.title);
      syncMeta("property", "og:description", latestProps.description);
      syncMeta("property", "og:url", latestProps.pageUrl);
      syncMeta("property", "og:image", latestProps.previewImage);
      syncMeta("name", "twitter:card", "summary_large_image");
      syncMeta("name", "twitter:title", latestProps.title);
      syncMeta("name", "twitter:description", latestProps.description);
      syncMeta("name", "twitter:image", latestProps.previewImage);
    };

    handle.signal.addEventListener(
      "abort",
      () => {
        latestProps = null;
        isQueued = false;
      },
      { once: true },
    );

    return (props: HeadProps) => {
      latestProps = props;
      if (!isQueued) {
        isQueued = true;
        handle.queueTask(sync);
      }
      return null;
    };
  },
);

function syncTitle(title: string) {
  let titles = document.head.querySelectorAll("title");
  let current = titles[0] ?? document.head.appendChild(document.createElement("title"));
  current.textContent = title;
  for (let index = 1; index < titles.length; index++) {
    titles[index]?.remove();
  }
}

function syncMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let selector = `meta[${attribute}="${key}"]`;
  let matches = Array.from(document.head.querySelectorAll<HTMLMetaElement>(selector));
  let current =
    matches[0] ?? document.head.appendChild(document.createElement("meta"));

  current.setAttribute(attribute, key);
  current.setAttribute("content", content);

  for (let index = 1; index < matches.length; index++) {
    matches[index]?.remove();
  }
}
