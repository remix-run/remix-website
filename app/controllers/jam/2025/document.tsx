import type { Handle, RemixNode } from "remix/ui";
import { Document } from "../../../ui/document.tsx";
import { styleHrefs } from "../../../utils/style-hrefs.ts";
import { getSocialHeadTags } from "../../../utils/social-head-tags.server.ts";
import { JamPageScaffold } from "./shared.tsx";

type JamPageProps = {
  title: string;
  description: string;
  previewImage: string;
  requestUrl: string;
  activePath: string;
  hideBackground?: boolean;
  showSeats?: boolean;
  children?: RemixNode;
};

export function JamDocument(handle: Handle<JamPageProps>) {
  return () => (
    <Document
      title={handle.props.title}
      description={handle.props.description}
      forceTheme="dark"
      stylesheets={[styleHrefs.app, styleHrefs.jam2025]}
      headTags={[
        ...getSocialHeadTags({
          requestUrl: handle.props.requestUrl,
          title: handle.props.title,
          description: handle.props.description,
          image: handle.props.previewImage,
        }),
      ]}
    >
      <JamPageScaffold
        activePath={handle.props.activePath}
        hideBackground={handle.props.hideBackground ?? false}
        showSeats={handle.props.showSeats ?? false}
      >
        {handle.props.children}
      </JamPageScaffold>
    </Document>
  );
}
