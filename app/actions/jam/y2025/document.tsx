import { css, type Handle, type RemixNode } from "remix/ui";
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
        stylesheets={["app"]}
        mix={jamDocumentStyle}
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

let jamDocumentStyle = css({
  scrollbarColor: "var(--color-gray-300) var(--color-gray-800)",
  "& body": {
    background:
      "radial-gradient(72% 63% at 50% 32.3%, #3b3b3b 0.036346160613726086%, rgb(26, 26, 26) 100%)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    scrollBehavior: "auto",
  },
});
