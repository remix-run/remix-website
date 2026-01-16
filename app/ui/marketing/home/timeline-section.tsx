import cx from "clsx";
import { Fragment } from "react";

export function TimelineSection() {
  return (
    <section className="bg-[var(--rmx-neutral-950)] text-white">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 pt-16 md:gap-16 md:pt-24">
        <h2
          className={cx(
            "rmx-heading-xl",
            "text-rmx-neutral-100",
            "text-center",
          )}
        >
          The story so far
        </h2>

        <div className="xl:hidden">
          <TimelineDiagramMobile />
        </div>

        <div className="hidden xl:block">
          <TimelineDiagramDesktop />
        </div>

        <div
          className={cx(
            "rmx-body-md rmx-body-on-dark rmx-home-timeline-bg",
            "mx-auto w-full max-w-[1024px] space-y-8 px-12 pb-16 md:space-y-12 md:pb-24",
          )}
        >
          <p>
            <span className="text-[var(--rmx-highlight-blue)]">
              The first version of Remix was a feature branch of React Router
            </span>
            : a full stack web framework that let you focus on the user
            interface and work back through web standards to deliver a fast,
            slick, and resilient user experience.
          </p>
          <p>
            <span className="text-[var(--rmx-highlight-red)]">
              We've now merged Remix's features directly into React Router
            </span>
            . If you're looking for a full stack, React-based framework built on
            Web APIs, check out React Router. We think it's the best way to ship
            React applications.
          </p>
          <p>
            <span className="text-[var(--rmx-highlight-green)]">
              Remix 3 is our latest full stack framework, built for immediate
              productivity whether you're using a fully agentic workflow or
              completely handwriting every line of code.
            </span>{" "}
            Remix 3 is built on web APIs and composed of multiple single-purpose
            modules, packaged up to give you everything you need to build any
            kind of website. It's lightweight, simple to understand, and
            powerful to wield. If you've ever wished for a development
            experience that feels lighter, faster, and more aligned with how the
            web works, Remix 3 is being built for you.
          </p>
        </div>

        <div className="sr-only">
          TODO: accessible milestone list (for screen readers)
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Constants & Configuration
// =============================================================================

const YEARS = Array.from({ length: 13 }, (_, index) => 2014 + index);

// Cell config: string for label, or object with optional label and style overrides
type CellConfig = string | { label?: string; style: React.CSSProperties };

const LANE_CELL_CONFIG: Record<string, Record<number, CellConfig>> = {
  "react-router": {
    2017: "v4",
    2019: "v5",
    2020: "v6",
    2024: "v7",
    2026: { style: { opacity: 1 } },
  },
  remix: {
    2021: "v1",
    2023: "v2",
  },
  "remix-3": {
    2025: { label: "💿", style: { fontSize: "20px" } },
    2026: { style: { opacity: 1 } },
  },
};

// =============================================================================
// Components
// =============================================================================

function TimelineDiagramMobile() {
  return (
    <div
      style={{
        display: "grid",
        width: "380px",
        gridTemplateColumns: `auto repeat(3, 1fr)`,

        gridTemplateRows: `repeat(${YEARS.length + 1}, 57px)`,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Lane background gradients - these span all rows */}
      <div
        style={{
          gridColumn: 2,
          gridRow: "1 / -1",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-red) 70%, var(--rmx-neutral-950) 100%)",
        }}
      />
      <div
        style={{
          gridColumn: 3,
          gridRow: "1 / -1",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-blue) 70%, var(--rmx-neutral-950) 100%)",
        }}
      />
      <div
        style={{
          gridColumn: 4,
          gridRow: "1 / -1",
          background:
            "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-shade-green) 70%, var(--rmx-neutral-950) 100%)",
        }}
      />

      {/* Year labels */}
      {YEARS.map((year, index) => (
        <YearLabel key={year} style={{ gridColumn: 1, gridRow: index + 2 }}>
          {year}
        </YearLabel>
      ))}

      {/* Lane headers on 2014 row (row 2) */}
      <LaneHeader style={{ gridColumn: 2, gridRow: 2 }}>
        React Router
      </LaneHeader>
      <LaneHeader style={{ gridColumn: 3, gridRow: 2 }}>Remix</LaneHeader>
      <LaneHeader style={{ gridColumn: 4, gridRow: 2 }}>Remix 3</LaneHeader>

      {/* Year markers or version labels for each lane - skip 2014 which has headers */}
      {YEARS.slice(1).map((year, index) => (
        <Fragment key={year}>
          <LaneCell
            lane="react-router"
            year={year}
            style={{ gridColumn: 2, gridRow: index + 3 }}
          />
          <LaneCell
            lane="remix"
            year={year}
            style={{ gridColumn: 3, gridRow: index + 3 }}
          />
          <LaneCell
            lane="remix-3"
            year={year}
            style={{ gridColumn: 4, gridRow: index + 3 }}
          />
        </Fragment>
      ))}
    </div>
  );
}

function LaneHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 800,
        lineHeight: 1.6,
        letterSpacing: "0.6px",
        color: "var(--rmx-neutral-100)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function YearLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const year = Number(children);
  // Years fade in from 2014 (0.25) to 2017+ (1.0)
  let opacity = 1;
  if (year === 2014) opacity = 0.25;
  else if (year === 2015) opacity = 0.5;
  else if (year === 2016) opacity = 0.75;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 24px",
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: "0.01em",
        color: "var(--rmx-text-tertiary)",
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function LaneCell({
  lane,
  year,
  style,
}: {
  lane: string;
  year: number;
  style?: React.CSSProperties;
}) {
  const config = LANE_CELL_CONFIG[lane]?.[year];

  const label = typeof config === "string" ? config : config?.label;
  const configStyle = typeof config === "object" ? config.style : undefined;

  if (label) {
    return (
      <div
        style={{
          alignSelf: "center",
          justifySelf: "center",
          fontSize: "12px",
          fontWeight: 700,
          lineHeight: 1.6,
          letterSpacing: "0.12px",
          color: "var(--rmx-neutral-100)",
          ...style,
          ...configStyle,
        }}
      >
        {label}
      </div>
    );
  }

  return <YearMarker style={style} markerStyle={configStyle} />;
}

function YearMarker({
  style,
  markerStyle,
}: {
  style?: React.CSSProperties;
  markerStyle?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        alignSelf: "center",
        justifySelf: "center",
        ...style,
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          border: "1px solid var(--rmx-neutral-100)",
          opacity: 0.4,
          ...markerStyle,
        }}
      />
    </div>
  );
}

export function TimelineDiagramDesktop() {
  // DON'T IMPLEMENT THIS YET
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8"></div>
  );
}
