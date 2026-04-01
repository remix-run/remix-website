import { getRequestContext } from "../../utils/request-context";
import { render } from "../../utils/render";
import { CACHE_CONTROL } from "../../utils/cache-control";
import {
  JamDocument,
  Paragraph,
  ScrambleText,
  Subheader,
  Title,
} from "./shared";
import { assetPaths } from "../../utils/asset-paths";

export async function jam2025CocHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/jam/2025/coc`;
  let previewImage = `${requestUrl.origin}${assetPaths.jam2025.ogThumbnail1}`;

  return render.document(
    <JamDocument
      title="Code of Conduct | Remix Jam 2025"
      description="Adapted from confcodeofconduct.com"
      pageUrl={pageUrl}
      previewImage={previewImage}
      activePath="/jam/2025/coc"
    >
      <main
        id="main-content"
        class="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[120px] md:pt-[270px] lg:pt-[280px]"
        tabIndex={-1}
      >
        <Title className="text-center">
          <ScrambleText
            setup={{ text: "Code of Conduct", delay: 100, color: "blue" }}
            className="whitespace-nowrap"
          />
        </Title>

        <div class="relative z-10 space-y-8 text-justify text-base text-white md:text-lg">
          <Paragraph>
            All attendees, speakers, and volunteers at our conference are
            required to agree with the following code of conduct. Organizers
            will enforce this code throughout the event. We are expecting
            cooperation from all participants to help ensuring a safe
            environment for everybody.
          </Paragraph>

          <section class="space-y-4">
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

          <section class="space-y-4">
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
              <a
                class="text-blue-400 hover:underline"
                href="mailto:jam@remix.run"
              >
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

          <div class="text-sm text-white/70">
            Adapted from{" "}
            <a
              class="text-blue-400 hover:underline"
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
    </JamDocument>,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}
