import { clientEntry, css, on, ref, type Handle } from "remix/ui";

import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";

export let JamTicketCard = clientEntry(
  import.meta.url,
  function JamTicketCard(
    handle: Handle<{
      ticketSrc: string;
      ticketHolographic: string;
      title?: string;
    }>,
  ) {
    let isHovered = false;
    let mousePosition = { x: 50, y: 50 };
    let ticketWidth = 0;
    let ticketHeight = 0;
    let ticketElement: HTMLElement | null = null;

    let updateDimensions = () => {
      if (!ticketElement) return;

      let rect = ticketElement.getBoundingClientRect();
      ticketWidth = rect.width;
      ticketHeight = rect.height;
    };

    handle.queueTask(() => {
      window.addEventListener("resize", updateDimensions, {
        signal: handle.signal,
      });
    });

    return () => {
      let tx = 0;
      let ty = 0;
      if (ticketWidth > 0 && ticketHeight > 0) {
        const xOffsetFactor = mousePosition.x / 100 - 0.5;
        const yOffsetFactor = mousePosition.y / 100 - 0.5;
        tx = ticketWidth * xOffsetFactor;
        ty = ticketHeight * yOffsetFactor;
      }

      return (
        <div
          data-jam-ticket-card
          mix={[
            css({
              zIndex: 10,
              width: "300px",
              userSelect: "none",
              perspective: "1500px",
              [breakpointMedia.md]: { width: "800px" },
            }),
            ref((node) => {
              ticketElement = node;
              updateDimensions();
            }),
            on("mouseenter", () => {
              isHovered = true;
              handle.update();
            }),
            on("mouseleave", () => {
              isHovered = false;
              handle.update();
            }),
            on("mousemove", (e) => {
              let rect = e.currentTarget.getBoundingClientRect();
              ticketWidth = rect.width;
              ticketHeight = rect.height;
              mousePosition = {
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              };
              handle.update();
            }),
          ]}
        >
          <div
            mix={css({
              position: "relative",
              isolation: "isolate",
              zIndex: 10,
              overflow: "hidden",
              border: "1px solid rgb(255 255 255 / 0.2)",
              borderRadius: "12px",
              transition: "transform 200ms ease-out",
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
            })}
            style={{
              transformStyle: "preserve-3d",
              transform: isHovered
                ? `rotateY(${(mousePosition.x - 50) * 0.15}deg) rotateX(${(mousePosition.y - 50) * -0.15}deg) scale(1.05)`
                : "rotateY(0deg) rotateX(0deg) scale(1)",
            }}
          >
            {/* Holographic effect overlay */}
            <div
              mix={css({
                position: "absolute",
                inset: 0,
                zIndex: 10,
                mixBlendMode: "color-dodge",
                transition: "opacity 300ms ease-in-out",
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                },
              })}
              style={{
                opacity: isHovered ? 0.5 : 0,
              }}
            >
              <div
                mix={css({
                  position: "absolute",
                  inset: 0,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  opacity: 0.2,
                })}
                style={{
                  backgroundImage: `url(${handle.props.ticketHolographic})`,
                }}
              />
              {/* Rainbow overlay */}
              <div
                mix={[
                  largeOverlayStyle,
                  css({
                    background:
                      "linear-gradient(135deg, rgb(255, 119, 115) 2%, rgb(255, 237, 95) 12.9661%, rgb(168, 255, 95) 23.5922%, rgb(131, 255, 247) 39.1029%, rgb(119, 221, 223) 48.545%, rgb(120, 148, 255) 59.1618%, rgb(209, 124, 242) 62.9954%, rgb(255, 119, 115) 76.7431%)",
                    opacity: 0.2,
                    mixBlendMode: "hue",
                  }),
                ]}
              />
              {/* Diagonal gradient overlay */}
              <div
                mix={[
                  largeOverlayStyle,
                  css({
                    background:
                      "linear-gradient(315deg, rgb(19, 20, 21) 0%, rgb(143, 163, 163) 6.03181%, rgb(162, 163, 163) 9.74451%, rgb(20, 20, 20) 25.0721%, rgb(143, 163, 163) 33.5357%, rgb(164, 166, 166) 35.2988%, rgb(37, 37, 38) 41.503%, rgb(161, 161, 161) 52.393%, rgb(124, 125, 125) 61.1346%, rgb(19, 20, 21) 66.269%, rgb(166, 166, 166) 74.4633%, rgb(163, 163, 163) 79.8987%, rgb(19, 20, 21) 85.7299%, rgb(161, 161, 161) 89.8948%, rgb(19, 20, 21) 100%)",
                    opacity: 0.5,
                    mixBlendMode: "plus-lighter",
                  }),
                ]}
              />
              {/* Radial highlight */}
              <div
                mix={css({
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(50% 50% at 50% 50%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.5) 43.6638%, rgba(255, 255, 255, 0.11) 80.5409%, rgba(255, 255, 255, 0) 100%)",
                  filter: "blur(24px)",
                  mixBlendMode: "overlay",
                })}
                style={{
                  transform: `translate(${tx}px, ${ty}px)`,
                }}
              />
            </div>

            <div mix={css({ filter: "contrast(1.05)" })}>
              <img
                src={handle.props.ticketSrc}
                width={800}
                height={280}
                alt="Remix Jam 2025 Event Ticket"
                mix={css({ position: "relative", width: "100%" })}
              />
            </div>

            <div
              mix={css({
                position: "absolute",
                bottom: 0,
                left: "35%",
                zIndex: 40,
                paddingBottom: "4px",
                paddingLeft: "8px",
                color: "#ffffff",
                fontFamily: theme.fontFamily.mono,
                fontSize: "8px",
                textAlign: "left",
                [breakpointMedia.md]: {
                  paddingBottom: "16px",
                  paddingLeft: "24px",
                  fontSize: "1rem",
                },
              })}
            >
              <div
                mix={css({
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  textTransform: "uppercase",
                  [breakpointMedia.md]: { gap: "8px" },
                })}
              >
                <p>october 10 2025</p>
                <div>
                  <p>your name</p>
                  <p>your company</p>
                </div>
                <p
                  mix={css({
                    color: theme.colors.brand.green,
                    textTransform: "uppercase",
                  })}
                >
                  {handle.props.title ?? "General Admission"}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };
  },
);

let largeOverlayStyle = css({
  position: "absolute",
  inset: 0,
  top: "50%",
  left: "50%",
  width: "160%",
  height: "160%",
  transform: "translate(-50%, -50%)",
});
