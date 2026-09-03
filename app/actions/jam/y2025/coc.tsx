import { css, type Handle } from "remix/ui";

import { routes } from "../../../routes.ts";
import { JamDocument } from "./document.tsx";
import { Paragraph, ScrambleText, Subheader, Title } from "./public/shared.tsx";
import { assetPaths } from "../../../utils/public/asset-paths.ts";
import { breakpointMedia } from "../../../ui/public/theme.ts";

export function Jam2025CocPage(handle: Handle<{ requestUrl: string }>) {
  return () => (
    <JamDocument
      title="Code of Conduct | Remix Jam 2025"
      description="Adapted from confcodeofconduct.com"
      previewImage={assetPaths.jam2025.ogThumbnail1}
      requestUrl={handle.props.requestUrl}
      activePath={routes.jam.y2025.coc.href()}
    >
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
        <Title mix={css({ textAlign: "center" })}>
          <ScrambleText
            text="Code of Conduct"
            delay={100}
            color="blue"
            nowrap
          />
        </Title>

        <div
          mix={css({
            position: "relative",
            zIndex: 10,
            color: "#ffffff",
            fontSize: "1rem",
            lineHeight: 1.5,
            textAlign: "justify",
            "& > * + *": { marginTop: "32px" },
            [breakpointMedia.md]: { fontSize: "1.125rem", lineHeight: 1.556 },
          })}
        >
          <Paragraph>
            All attendees, speakers, and volunteers at our conference are
            required to agree with the following code of conduct. Organizers
            will enforce this code throughout the event. We are expecting
            cooperation from all participants to help ensuring a safe
            environment for everybody.
          </Paragraph>

          <section mix={cocSectionStyle}>
            <Subheader>The Quick Version</Subheader>
            <Paragraph>
              Our conference is dedicated to providing a harassment-free
              conference experience for everyone, regardless of gender, gender
              identity and expression, age, sexual orientation, disability,
              physical appearance, body size, race, ethnicity, religion (or lack
              thereof), or technology choices. We do not tolerate harassment of
              conference participants in any form. Sexual language and imagery
              is not appropriate for any conference venue, including talks,
              workshops, parties, X and other online media. Conference
              participants violating these rules may be sanctioned or expelled
              from the conference <em>without a refund</em> at the discretion of
              the conference organizers.
            </Paragraph>
          </section>

          <section mix={cocSectionStyle}>
            <Subheader>The Less Quick Version</Subheader>

            <Paragraph>
              Harassment includes offensive verbal comments related to gender,
              gender identity and expression, age, sexual orientation,
              disability, physical appearance, body size, race, ethnicity,
              religion, technology choices, sexual images in public spaces,
              deliberate intimidation, stalking, following, harassing
              photography or recording, sustained disruption of talks or other
              events, inappropriate physical contact, and unwelcome sexual
              attention.
            </Paragraph>

            <Paragraph>
              Participants asked to stop any harassing behavior are expected to
              comply immediately.
            </Paragraph>

            <Paragraph>
              If a participant engages in harassing behavior, the conference
              organizers may take any action they deem appropriate, including
              warning the offender or expulsion from the conference with no
              refund.
            </Paragraph>

            <Paragraph>
              If you are being harassed, notice that someone else is being
              harassed, or have any other concerns, please contact a member of
              conference staff immediately. Conference staff can be identified
              as they&apos;ll be wearing branded t-shirts. Or email{" "}
              <a mix={textLinkStyle} href="mailto:jam@remix.run">
                jam@remix.run
              </a>
              .
            </Paragraph>

            <Paragraph>
              Conference staff will be happy to help participants contact
              hotel/venue security or local law enforcement, provide escorts, or
              otherwise assist those experiencing harassment to feel safe for
              the duration of the conference. We value your attendance.
            </Paragraph>

            <Paragraph>
              We expect participants to follow these rules at conference and
              workshop venues and conference-related social events.
            </Paragraph>
          </section>

          <div
            mix={css({
              color: "rgb(255 255 255 / 0.7)",
              fontSize: "0.875rem",
            })}
          >
            Adapted from{" "}
            <a
              mix={textLinkStyle}
              target="_blank"
              rel="noopener noreferrer"
              href="https://confcodeofconduct.com"
            >
              confcodeofconduct.com
            </a>
            .
          </div>
        </div>
      </main>
    </JamDocument>
  );
}

let cocSectionStyle = css({ "& > * + *": { marginTop: "16px" } });

let textLinkStyle = css({
  color: "#59b0ff",
  "&:hover": { textDecoration: "underline" },
});
