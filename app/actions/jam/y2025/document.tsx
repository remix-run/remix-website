import type { Handle, RemixNode } from "remix/ui";
import { Document } from "../../../ui/document.tsx";
import { getSocialHeadTags } from "../../../utils/social-head-tags.ts";
import { JamPageScaffold } from "./public/shared.tsx";

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
  return () => {
    let {
      title,
      description,
      previewImage,
      requestUrl,
      activePath,
      hideBackground = false,
      showSeats = false,
      children,
    } = handle.props;

    return (
      <Document
        title={title}
        description={description}
        forceTheme="dark"
        stylesheets={["app", "jam2025"]}
        headTags={getSocialHeadTags({
          requestUrl,
          title,
          description,
          image: previewImage,
        })}
      >
        <JamPageScaffold
          activePath={activePath}
          hideBackground={hideBackground}
          showSeats={showSeats}
        >
          {children}
        </JamPageScaffold>
      </Document>
    );
  };
}
