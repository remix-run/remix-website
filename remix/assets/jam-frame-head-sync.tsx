import { clientEntry, type Handle } from "remix/component";
import { syncManagedHeadTags, syncTitle } from "../components/document-head";
import jamStylesHref from "../shared/styles/jam.css?url";
import assets from "./jam-frame-head-sync.tsx?assets=client";

type HeadProps = {
  title: string;
  description: string;
  pageUrl: string;
  previewImage: string;
};

export let JamFrameHeadSync = clientEntry(
  `${assets.entry}#JamFrameHeadSync`,
  (handle: Handle) => {
    let latestProps: HeadProps | null = null;
    let isQueued = false;

    let sync = () => {
      isQueued = false;
      if (!latestProps) return;

      syncTitle(latestProps.title);
      syncManagedHeadTags([
        { kind: "meta", name: "description", content: latestProps.description },
        { kind: "meta", property: "og:type", content: "website" },
        { kind: "meta", property: "og:title", content: latestProps.title },
        {
          kind: "meta",
          property: "og:description",
          content: latestProps.description,
        },
        { kind: "meta", property: "og:url", content: latestProps.pageUrl },
        {
          kind: "meta",
          property: "og:image",
          content: latestProps.previewImage,
        },
        {
          kind: "meta",
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          kind: "meta",
          name: "twitter:title",
          content: latestProps.title,
        },
        {
          kind: "meta",
          name: "twitter:description",
          content: latestProps.description,
        },
        {
          kind: "meta",
          name: "twitter:image",
          content: latestProps.previewImage,
        },
        { kind: "link", rel: "stylesheet", href: jamStylesHref },
        {
          kind: "link",
          rel: "preload",
          href: "/font/jet-brains-mono.woff2",
          as: "font",
          crossorigin: "anonymous",
        },
      ]);
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
