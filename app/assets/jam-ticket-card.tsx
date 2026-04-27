import {
  addEventListeners,
  clientEntry,
  on,
  ref,
  type Handle,
} from "remix/component";

export let JamTicketCard = clientEntry(
  import.meta.url,
  function JamTicketCard(handle: Handle) {
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
      addEventListeners(window, handle.signal, { resize: updateDimensions });
    });

    return (props: {
      ticketSrc: string;
      ticketHolographic: string;
      title?: string;
    }) => {
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
          class="group z-10 w-[300px] select-none md:w-[800px]"
          style={{ perspective: "1500px" }}
          mix={[
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
            class="relative isolate z-10 overflow-hidden rounded-xl border border-white/20 transition-transform duration-200 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isHovered
                ? `rotateY(${(mousePosition.x - 50) * 0.15}deg) rotateX(${(mousePosition.y - 50) * -0.15}deg) scale(1.05)`
                : "rotateY(0deg) rotateX(0deg) scale(1)",
            }}
          >
            {/* Holographic effect overlay */}
            <div
              class="absolute inset-0 z-10 mix-blend-color-dodge transition-opacity duration-300 ease-in-out"
              style={{
                opacity: isHovered ? 0.5 : 0,
              }}
            >
              <div
                class="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${props.ticketHolographic})` }}
              />
              {/* Rainbow overlay */}
              <div
                class="absolute inset-0 left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 opacity-20 mix-blend-hue"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(255, 119, 115) 2%, rgb(255, 237, 95) 12.9661%, rgb(168, 255, 95) 23.5922%, rgb(131, 255, 247) 39.1029%, rgb(119, 221, 223) 48.545%, rgb(120, 148, 255) 59.1618%, rgb(209, 124, 242) 62.9954%, rgb(255, 119, 115) 76.7431%)",
                }}
              />
              {/* Diagonal gradient overlay */}
              <div
                class="absolute inset-0 left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 opacity-50 mix-blend-plus-lighter"
                style={{
                  background:
                    "linear-gradient(315deg, rgb(19, 20, 21) 0%, rgb(143, 163, 163) 6.03181%, rgb(162, 163, 163) 9.74451%, rgb(20, 20, 20) 25.0721%, rgb(143, 163, 163) 33.5357%, rgb(164, 166, 166) 35.2988%, rgb(37, 37, 38) 41.503%, rgb(161, 161, 161) 52.393%, rgb(124, 125, 125) 61.1346%, rgb(19, 20, 21) 66.269%, rgb(166, 166, 166) 74.4633%, rgb(163, 163, 163) 79.8987%, rgb(19, 20, 21) 85.7299%, rgb(161, 161, 161) 89.8948%, rgb(19, 20, 21) 100%)",
                }}
              />
              {/* Radial highlight */}
              <div
                class="absolute inset-0 mix-blend-overlay blur-xl"
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 50%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.5) 43.6638%, rgba(255, 255, 255, 0.11) 80.5409%, rgba(255, 255, 255, 0) 100%)",
                  transform: `translate(${tx}px, ${ty}px)`,
                }}
              />
            </div>

            <div class="contrast-[1.05]">
              <img
                src={props.ticketSrc}
                width={800}
                height={280}
                alt="Remix Jam 2025 Event Ticket"
                class="relative w-full"
              />
            </div>

            <div class="absolute bottom-0 left-[35%] z-40 pb-1 pl-2 text-left font-mono text-[8px] text-white md:pb-4 md:pl-6 md:text-base">
              <div class="flex flex-col gap-0 uppercase md:gap-2">
                <p>october 10 2025</p>
                <div>
                  <p>your name</p>
                  <p>your company</p>
                </div>
                <p class="uppercase text-green-brand">
                  {props.title ?? "General Admission"}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };
  },
);
