import type { Handle, RemixNode } from "remix/ui";
import { Document } from "../../../ui/document.tsx";
import { styleHrefs } from "../../../utils/style-hrefs.ts";
import { getSocialHeadTags } from "../../../utils/social-head-tags.server.ts";
import { JamPageScaffold } from "./shared.tsx";

type JamPageProps = {
  title: string;
  description: string;
  previewImage: string;
  activePath: string;
  hideBackground?: boolean;
  showSeats?: boolean;
  children?: RemixNode;
};

export function JamDocument(handle: Handle<JamPageProps>) {
  let { props } = handle;
  return () => (
    <Document
      title={props.title}
      description={props.description}
      forceTheme="dark"
      stylesheets={[styleHrefs.app, styleHrefs.jam2025]}
      headTags={[
        ...getSocialHeadTags({
          title: props.title,
          description: props.description,
          image: props.previewImage,
        }),
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
