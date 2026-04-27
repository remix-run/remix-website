import type { RemixNode } from "remix/component";
import { Document } from "../../ui/document";
import { styleHrefs } from "../../utils/style-hrefs";
import { JamPageScaffold } from "./shared";

type JamPageProps = {
  title: string;
  description: string;
  pageUrl: string;
  previewImage: string;
  activePath: string;
  hideBackground?: boolean;
  showSeats?: boolean;
  children?: RemixNode;
};

export function JamDocument() {
  return (props: JamPageProps) => (
    <Document
      title={props.title}
      description={props.description}
      forceTheme="dark"
      headTags={[
        { kind: "meta", property: "og:type", content: "website" },
        { kind: "meta", property: "og:title", content: props.title },
        {
          kind: "meta",
          property: "og:description",
          content: props.description,
        },
        { kind: "meta", property: "og:url", content: props.pageUrl },
        {
          kind: "meta",
          property: "og:image",
          content: props.previewImage,
        },
        {
          kind: "meta",
          name: "twitter:card",
          content: "summary_large_image",
        },
        { kind: "meta", name: "twitter:title", content: props.title },
        {
          kind: "meta",
          name: "twitter:description",
          content: props.description,
        },
        {
          kind: "meta",
          name: "twitter:image",
          content: props.previewImage,
        },
        { kind: "link", rel: "stylesheet", href: styleHrefs.jam },
        {
          kind: "link",
          rel: "preload",
          href: "/font/jet-brains-mono.woff2",
          as: "font",
          crossorigin: "anonymous",
        },
      ]}
    >
      <JamPageScaffold
        activePath={props.activePath}
        hideBackground={props.hideBackground ?? false}
        showSeats={props.showSeats ?? false}
      >
        {props.children}
      </JamPageScaffold>
    </Document>
  );
}
