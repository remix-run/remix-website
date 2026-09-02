import { css, type Handle, type RemixNode } from "remix/ui";
import { JamDocument } from "./document.tsx";
import {
  AddressLink,
  Paragraph,
  ScrambleText,
  Subheader,
  Title,
} from "./public/shared.tsx";
import { routes } from "../../../routes.ts";
import { assetPaths } from "../../../utils/public/asset-paths.ts";
import { breakpointMedia, theme } from "../../../ui/public/theme.ts";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function Jam2025FaqPage(handle: Handle<{ requestUrl: string }>) {
  return () => (
    <JamDocument
      title="FAQ | Remix Jam 2025"
      description="It's time to get the band back together"
      previewImage={assetPaths.jam2025.ogThumbnail1}
      requestUrl={handle.props.requestUrl}
      activePath={routes.jam.y2025.faq.href()}
    >
      <main
        id="main-content"
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
        tabIndex={-1}
      >
        <Title mix={css({ textAlign: "center" })}>
          <ScrambleText
            text="Frequently Asked"
            delay={100}
            color="blue"
            nowrap
          />
          <ScrambleText text="Questions" delay={300} color="green" />
        </Title>

        <div
          mix={css({
            position: "relative",
            zIndex: 10,
            color: "#ffffff",
            fontSize: "1rem",
            lineHeight: 1.5,
            textAlign: "justify",
            [breakpointMedia.md]: { fontSize: "1.125rem", lineHeight: 1.556 },
          })}
        >
          <FAQSection
            question="Where can I find the event lineup?"
            answer={
              <Paragraph>
                Checkout our full{" "}
                <a href={routes.jam.y2025.lineup.href()}>Schedule & Lineup</a>{" "}
                for the list of speakers and topics, as well as all the day-of
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
                  Check-in starts at <strong mix={strongStyle}>8:30 AM</strong>{" "}
                  in the lobby. Enter on the west side of the building on
                  Waterloo Terrace.
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
                <ul mix={faqListStyle}>
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

                <Paragraph mix={strongStyle}>
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
              <ul mix={faqListStyle}>
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
                    mix={textLinkStyle}
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
    </JamDocument>
  );
}

function FAQSection(handle: Handle<{ question: string; answer: RemixNode }>) {
  return () => {
    let id = slugify(handle.props.question);
    return (
      <section
        id={id}
        mix={css({
          marginTop: "20px",
          scrollMarginTop: "128px",
          color: "#ffffff",
          fontSize: "1rem",
          lineHeight: 1.5,
          "& > * + *": { marginTop: "12px" },
          [breakpointMedia.md]: { fontSize: "1.125rem", lineHeight: 1.556 },
          [breakpointMedia.lg]: { marginTop: "40px" },
        })}
      >
        <Subheader>
          <a
            href={`#${id}`}
            mix={css({ "&:hover": { textDecoration: "underline" } })}
          >
            {handle.props.question}
          </a>
        </Subheader>
        {typeof handle.props.answer === "string" ? (
          <Paragraph>{handle.props.answer}</Paragraph>
        ) : (
          handle.props.answer
        )}
      </section>
    );
  };
}

function JamEmail() {
  return () => (
    <a href="mailto:jam@remix.run" mix={textLinkStyle}>
      jam@remix.run
    </a>
  );
}

let strongStyle = css({
  color: "#ffffff",
  fontWeight: theme.fontWeight.bold,
});

let faqListStyle = css({
  paddingLeft: "32px",
  listStyleType: "disc",
  "& > * + *": { marginTop: "4px" },
});

let textLinkStyle = css({
  color: "#59b0ff",
  "&:hover": { textDecoration: "underline" },
});
