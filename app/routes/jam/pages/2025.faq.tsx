import { Fragment } from "react";
import { Link } from "react-router";
import { Navbar } from "../navbar";
import { AddressLink } from "../utils";
import { ScrambleText, Title, Subheader, Paragraph } from "../text";
import { getMeta } from "~/lib/meta";
import { slugify } from "~/ui/primitives/utils";
import ogImageSrc from "../images/og-thumbnail-1.jpg";

import type { Route } from "./+types/2025.faq";

export function meta({ matches }: Route.MetaArgs) {
  const [rootMatch] = matches;
  const { siteUrl } = rootMatch.data;

  let image = `${siteUrl}${ogImageSrc}`;

  return getMeta({
    title: "Remix Jam 2025",
    description: "It's time to get the band back together",
    siteUrl: `${siteUrl}/jam`,
    image,
  });
}

export default function JamFAQPage() {
  return (
    <>
      <Navbar className="z-40" />
      <main className="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[120px] md:pt-[270px] lg:pt-[280px]">
        <Title className="text-center">
          <ScrambleText
            className="whitespace-nowrap"
            text="Frequently Asked"
            delay={100}
            charDelay={80}
            cyclesToResolve={8}
            color="blue"
          />
          <ScrambleText text="Questions" delay={300} color="green" />
        </Title>

        <div className="relative z-10 text-base text-white md:text-lg">
          <FAQSection
            question="Where can I find the event lineup?"
            answer="Our lineup will be announced in July with a range of speakers and topics. Be sure to sign up for the Remix Newsletter to get notified when it's announced!"
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
            question="Where will the event be hosted?"
            answer={
              <>
                <Paragraph>
                  The Remix team is hosting this event in conjunction with
                  Shopify at <AddressLink />.
                </Paragraph>
              </>
            }
          />

          <FAQSection
            question="Where should I stay?"
            answer={
              <>
                <Paragraph>We have 2 hotel blocks for the event:</Paragraph>
                <ul className="list-disc space-y-1 pl-8">
                  <li>
                    <a
                      href="https://reservation.germainhotels.com/ibe/details.aspx?propertyid=17522&nights=2&checkin=10/09/2025&group=2510SHOPIF&lang=en-us&adults=2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
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
                      className="text-blue-400 hover:underline"
                    >
                      Hyatt Regency Toronto
                    </a>{" "}
                    — $279/night
                  </li>
                </ul>

                <Paragraph className="font-bold text-white">
                  You must select the dates Oct 9-11.
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
              <ul className="list-disc space-y-1 pl-8">
                <li>
                  Check{" "}
                  <a
                    href="https://ircc.canada.ca/english/visit/visas.asp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
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
                    className="text-blue-400 hover:underline"
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
                    className="text-blue-400 hover:underline"
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
            answer="There are no refunds, but tickets will be transferable."
          />

          <FAQSection
            question="How do I transfer a ticket?"
            answer="Ask Brooks!"
          />

          <FAQSection
            question="What if I have other questions?"
            answer="You guessed it, ask Brooks!"
          />
        </div>
      </main>
    </>
  );
}

function FAQSection({
  question,
  answer,
}: {
  question: React.ReactNode;
  answer: React.ReactNode;
}) {
  const id = slugify(
    typeof question === "string" ? question : question?.toString() || "",
  );

  return (
    <section
      id={id}
      className="mt-5 scroll-mt-32 space-y-3 text-base text-white md:text-lg lg:mt-10"
    >
      <Subheader>
        <Link to={`#${id}`} className="hover:underline">
          {question}
        </Link>
      </Subheader>
      {typeof answer === "string" ? (
        <Paragraph>{replaceBrooksWithLink(answer)}</Paragraph>
      ) : (
        answer
      )}
    </section>
  );
}

// Really wanting RSC right now
function replaceBrooksWithLink(children: React.ReactNode): React.ReactNode {
  if (typeof children !== "string") return children;

  const parts = children.split("Brooks");
  if (parts.length === 1) return children;

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? (
            <a
              className="text-blue-400 hover:underline"
              href="mailto:brooks.lybrand@shopify.com"
            >
              Brooks
            </a>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}
