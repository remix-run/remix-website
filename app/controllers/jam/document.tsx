import type { RemixNode } from "remix/ui";
import { Document } from "../../ui/document";
import { styleHrefs } from "../../utils/style-hrefs";
import { getSocialHeadTags } from "../../utils/social-head-tags.server";
import { JamPageScaffold } from "./shared";

type JamPageProps = {
  title: string;
  description: string;
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
        ...getSocialHeadTags({
          title: props.title,
          description: props.description,
          image: props.previewImage,
        }),
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
