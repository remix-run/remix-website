import { css, type Handle } from "remix/ui";
import { getSchedule } from "../../../data/jam-schedule.ts";
import { routes } from "../../../routes.ts";
import { JamDocument } from "./document.tsx";
import { ScrambleText, Title } from "./public/shared.tsx";
import { assetPaths } from "../../../utils/public/asset-paths.ts";
import {
  JamLineupAccordionItem,
  scheduleGridStyle,
} from "./public/lineup-accordion-item.tsx";
import { breakpointMedia, theme } from "../../../ui/public/theme.ts";

type Schedule = Awaited<ReturnType<typeof getSchedule>>;

export function Jam2025LineupPage(
  handle: Handle<{ requestUrl: string; schedule: Schedule }>,
) {
  return () => (
    <JamDocument
      title="Schedule and Lineup | Remix Jam 2025"
      description="Schedule and Speaker Lineup for Remix Jam 2025"
      previewImage={assetPaths.jam2025.ogThumbnail1}
      requestUrl={handle.props.requestUrl}
      activePath={routes.jam.y2025.lineup.href()}
      hideBackground
      showSeats
    >
      <main
        id="main-content"
        mix={css({
          display: "flex",
          maxWidth: "1200px",
          marginInline: "auto",
          flexDirection: "column",
          alignItems: "center",
          paddingBlock: "80px",
          paddingTop: "120px",
          [breakpointMedia.md]: { paddingTop: "180px" },
          [breakpointMedia.lg]: { paddingTop: "200px" },
        })}
        tabIndex={-1}
      >
        <Title mix={css({ textAlign: "center" })}>
          <ScrambleText text="Schedule" delay={100} color="blue" />
          <ScrambleText text="& Lineup" delay={300} color="green" />
        </Title>

        <div
          mix={css({
            display: "flex",
            width: "100%",
            flexDirection: "column",
            gap: "4px",
            marginTop: "64px",
            paddingBlock: "24px",
            [breakpointMedia.sm]: {
              marginTop: "96px",
              padding: "36px 8px",
            },
          })}
        >
          <h1
            mix={css({
              color: "#ffffff",
              fontSize: "1.125rem",
              lineHeight: 1.556,
              [breakpointMedia.sm]: { fontSize: "1.875rem", lineHeight: 1.2 },
            })}
          >
            Friday
          </h1>
          <h2
            mix={css({
              color: "#ffffff",
              fontSize: "1.25rem",
              fontWeight: theme.fontWeight.bold,
              lineHeight: 1.556,
              [breakpointMedia.sm]: { fontSize: "2.25rem", lineHeight: 1.111 },
              [breakpointMedia.md]: { fontSize: "3rem", lineHeight: 1.083 },
            })}
          >
            Oct 10 2025
          </h2>
        </div>

        <ScheduleTable items={handle.props.schedule} />
      </main>
    </JamDocument>
  );
}

function ScheduleTable(handle: Handle<{ items: Schedule }>) {
  return () => (
    <>
      <section
        mix={css({
          zIndex: 10,
          width: "100%",
          [breakpointMedia.sm]: { display: "none" },
        })}
      >
        <div
          mix={css({
            marginInline: "-40px",
            borderBlock: "2px solid rgb(255 255 255 / 0.2)",
            paddingInline: "16px",
          })}
        >
          <div
            mix={[
              scheduleGridStyle,
              css({
                padding: "24px",
                color: "rgb(255 255 255 / 0.4)",
                fontFamily: theme.fontFamily.mono,
                fontSize: "0.75rem",
                lineHeight: 1.333,
                textTransform: "uppercase",
              }),
            ]}
          >
            <div>Time</div>
            <div>Topic</div>
            <div>Speaker</div>
          </div>

          {handle.props.items.map((item) => {
            let key = `${item.time}-${item.title}`;
            return (
              <div key={key} mix={css({ overflow: "hidden" })}>
                <div
                  mix={[
                    scheduleGridStyle,
                    css({
                      marginBlock: "8px",
                      borderTop: "1px solid rgb(255 255 255 / 0.1)",
                      padding: "24px",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                      fontWeight: theme.fontWeight.bold,
                      lineHeight: 1.425,
                    }),
                  ]}
                >
                  <span>
                    {item.time}
                    <br />
                    <span
                      mix={css({
                        color: "rgb(255 255 255 / 0.6)",
                        fontSize: "0.75rem",
                        fontWeight: theme.fontWeight.normal,
                        lineHeight: 1.333,
                      })}
                    >
                      (UTC-04:00)
                    </span>
                  </span>
                  <span>{item.title}</span>
                  <span>{item.speaker}</span>
                </div>
                <div mix={css({ paddingBottom: "24px" })}>
                  <div
                    mix={[scheduleGridStyle, css({ paddingInline: "24px" })]}
                  >
                    <div
                      mix={css({
                        gridColumn: "1 / -1",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        lineHeight: 1.425,
                        "& a": { color: "#59b0ff" },
                        "& a:hover": { textDecoration: "underline" },
                      })}
                      innerHTML={item.description}
                    />
                    {item.imgSrc ? (
                      <img
                        src={item.imgSrc}
                        alt={item.speaker}
                        mix={css({
                          gridColumn: "1 / -1",
                          width: "100%",
                          borderRadius: "16px",
                          objectFit: "cover",
                          aspectRatio: "1",
                        })}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    {item.bio ? (
                      <div
                        mix={css({
                          gridColumn: "1 / -1",
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                          color: "#ffffff",
                          fontFamily: theme.fontFamily.mono,
                          fontSize: "0.75rem",
                          lineHeight: "20px",
                          "& a": { color: "#59b0ff" },
                          "& a:hover": { textDecoration: "underline" },
                        })}
                        innerHTML={item.bio}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        mix={css({
          zIndex: 10,
          display: "none",
          width: "100%",
          paddingInline: "16px",
          [breakpointMedia.sm]: { display: "block" },
        })}
      >
        <div
          mix={css({
            marginInline: "-40px",
            borderBlock: "2px solid rgb(255 255 255 / 0.2)",
          })}
        >
          <div
            mix={[
              scheduleGridStyle,
              css({
                padding: "16px",
                color: "rgb(255 255 255 / 0.4)",
                fontFamily: theme.fontFamily.mono,
                fontSize: "0.75rem",
                lineHeight: 1.333,
                textTransform: "uppercase",
                [breakpointMedia.sm]: {
                  padding: "24px",
                  fontSize: "0.875rem",
                  lineHeight: 1.425,
                },
                [breakpointMedia.md]: { padding: "32px" },
                [breakpointMedia.lg]: { padding: "36px" },
              }),
            ]}
          >
            <div>Time (UTC-04:00)</div>
            <div>Topic</div>
            <div>Speaker</div>
            <div />
          </div>
          {handle.props.items.map((item) => {
            let key = `${item.time}-${item.title}`;
            return <DesktopScheduleItem key={key} item={item} />;
          })}
        </div>
      </section>
    </>
  );
}

function DesktopScheduleItem(handle: Handle<{ item: Schedule[number] }>) {
  return () => <JamLineupAccordionItem item={handle.props.item} />;
}
