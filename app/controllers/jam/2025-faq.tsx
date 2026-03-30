import type { RemixNode } from "remix/component/jsx-runtime";
import { getRequestContext } from "../../utils/request-context";
import { render } from "../../utils/render";
import { CACHE_CONTROL } from "../../utils/cache-control";
import {
  AddressLink,
  JamDocument,
  Paragraph,
  ScrambleText,
  Subheader,
  Title,
} from "./shared";
import { routes } from "../../routes";
import { assetPaths } from "../../utils/asset-paths";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function jam2025FaqHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/jam/2025/faq`;
  let previewImage = `${requestUrl.origin}${assetPaths.jam2025.ogThumbnail1}`;

  return render.document(
    <JamDocument
      title="FAQ | Remix Jam 2025"
      description="It's time to get the band back together"
      pageUrl={pageUrl}
      previewImage={previewImage}
      activePath="/jam/2025/faq"
    >
      <main
        id="main-content"
        class="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[120px] md:pt-[270px] lg:pt-[280px]"
        tabIndex={-1}
      >
        <Title className="text-center">
          <ScrambleText
            setup={{ text: "Frequently Asked", delay: 100, color: "blue" }}
            className="whitespace-nowrap"
          />
          <ScrambleText
            setup={{ text: "Questions", delay: 300, color: "green" }}
          />
        </Title>

        <div class="relative z-10 text-justify text-base text-white md:text-lg">
          <FAQSection
            question="Where can I find the event lineup?"
            answer={
              <Paragraph>
                Checkout our full{" "}
                <a href={routes.jam2025Lineup.href()}>Schedule & Lineup</a> for
                the list of speakers and topics, as well as all the day-of
                information you need.
              </Paragraph>
            }
          />

          <FAQSection
            question="Where will the event be hosted?"
            answer={
              <>
                <Paragraph>
                  The Remix team is hosting this event at the Shopify Toronto
                  office: <AddressLink />.
                </Paragraph>
                <Paragraph>
                  Check-in starts at{" "}
                  <strong class="font-bold text-white">8:30 AM</strong> in the
                  lobby. Enter on the west side of the building on Waterloo
                  Terrace.
                </Paragraph>
              </>
            }
          />

          <FAQSection
            question="Will there be a bag check?"
            answer={
              <Paragraph>
                Yes, there will be bag and coat check available all day on L11
                (the first floor you will go to after registration).
              </Paragraph>
            }
          />

          <FAQSection
            question="Will there be a CFP?"
            answer={
              <>
                <Paragraph>No, there will not be a CFP.</Paragraph>
                <Paragraph>
                  We are putting together a great "set list" of speakers and
                  topics exploring the past, present, and future of Remix and
                  the web. You can expect to hear from the founders, well known
                  members of the community, and other industry experts.
                </Paragraph>
                <Paragraph>
                  The full lineup will be announced in July.
                </Paragraph>
              </>
            }
          />

          <FAQSection
            question="Where should I stay?"
            answer={
              <>
                <Paragraph>We have 2 hotel blocks for the event:</Paragraph>
                <ul class="list-disc space-y-1 pl-8">
                  <li>
                    <a
                      href="https://reservation.germainhotels.com/ibe/details.aspx?propertyid=17522&nights=2&checkin=10/09/2025&group=2510SHOPIF&lang=en-us&adults=2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Le Germain Mercer
                    </a>{" "}
                    — $259/night
                  </li>
                  <li>
                    <a
                      href="https://www.hyatt.com/en-US/group-booking/TORRT/G-SH0F"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Hyatt Regency Toronto
                    </a>{" "}
                    — $279/night
                  </li>
                </ul>

                <Paragraph className="font-bold text-white">
                  <strong>You must select the dates Oct 9-11.</strong>
                </Paragraph>
              </>
            }
          />

          <FAQSection
            question="What airport should I fly into?"
            answer="The closest airport is Toronto Pearson International Airport (YYZ)."
          />

          <FAQSection
            question="Do I need a visa to attend?"
            answer={
              <ul class="list-disc space-y-1 pl-8">
                <li>
                  Check{" "}
                  <a
                    href="https://ircc.canada.ca/english/visit/visas.asp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    if you need a visa
                  </a>{" "}
                  (<i>select "attending meetings/conference"</i>).
                </li>
                <li>
                  Determine{" "}
                  <a
                    href="https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    visa processing times
                  </a>
                  .
                </li>
                <li>
                  Request a{" "}
                  <a
                    href="https://forms.gle/DdPs7rREJaFz8Pzf9"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-400 hover:underline"
                  >
                    letter of invitation
                  </a>{" "}
                  from Shopify.
                </li>
              </ul>
            }
          />

          <FAQSection
            question="What's the refund policy?"
            answer="There are no refunds, but tickets are transferable."
          />

          <FAQSection
            question="How do I get an invoice for tax purposes?"
            answer={
              <Paragraph>
                Please email <JamEmail /> for invoice requests.
              </Paragraph>
            }
          />

          <FAQSection
            question="How do I transfer a ticket?"
            answer={
              <Paragraph>
                Please email <JamEmail /> for ticket transfer requests.
              </Paragraph>
            }
          />

          <FAQSection
            question="What if I have other questions?"
            answer={
              <Paragraph>
                You guessed it, email <JamEmail />.
              </Paragraph>
            }
          />
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

function FAQSection() {
  return (props: { question: string; answer: RemixNode }) => {
    let id = slugify(props.question);
    return (
      <section
        id={id}
        class="mt-5 scroll-mt-32 space-y-3 text-base text-white md:text-lg lg:mt-10"
      >
        <Subheader>
          <a href={`#${id}`} class="hover:underline">
            {props.question}
          </a>
        </Subheader>
        {typeof props.answer === "string" ? (
          <Paragraph>{props.answer}</Paragraph>
        ) : (
          props.answer
        )}
      </section>
    );
  };
}

function JamEmail() {
  return () => (
    <a href="mailto:jam@remix.run" class="text-blue-400 hover:underline">
      jam@remix.run
    </a>
  );
}
