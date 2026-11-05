import { css, type Handle, type RemixNode } from "remix/component";
import { breakpointMedia } from "../../../ui/public/theme.ts";
import { Document } from "../../../ui/document.tsx";
import { getSocialHeadTags } from "../../../utils/social-head-tags.ts";
import { JamPageScaffold } from "./public/page-scaffold.tsx";
import { Title } from "./public/typography.tsx";

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
        mix={css({
          scrollbarColor: "var(--color-gray-300) var(--color-gray-800)",
          "& body": {
            background:
              "radial-gradient(72% 63% at 50% 32.3%, #3b3b3b 0.036346160613726086%, rgb(26, 26, 26) 100%)",
          },
          "@media (prefers-reduced-motion: reduce)": {
            scrollBehavior: "auto",
          },
        })}
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

/** Centered single-column layout shared by the long-form 2025 text pages. */
export function JamTextPage(
  handle: Handle<
    Omit<JamPageProps, "hideBackground" | "showSeats"> & { heading: RemixNode }
  >,
) {
  return () => {
    let { heading, children, ...documentProps } = handle.props;
    return (
      <JamDocument {...documentProps}>
        <main
          mix={css({
            display: "flex",
            maxWidth: "800px",
            marginInline: "auto",
            flexDirection: "column",
            alignItems: "center",
            gap: "48px",
            paddingBlock: "80px",
            paddingTop: "120px",
            [breakpointMedia.md]: { paddingTop: "270px" },
            [breakpointMedia.lg]: { paddingTop: "280px" },
          })}
        >
          <Title mix={css({ textAlign: "center" })}>{heading}</Title>
          {children}
        </main>
      </JamDocument>
    );
  };
}
