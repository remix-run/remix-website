import { clientEntry, css, ref, type Handle } from "remix/ui";
import {
  animateEntrance,
  animateExit,
  animateLayout,
  easings,
  spring,
  tween,
} from "remix/ui/animation";
import * as tabs from "remix/ui/tabs/primitives";
import { textBoxTrim } from "../../../../ui/public/css-mixins.ts";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";
import { colors, glowWhite, pageMaxWidth } from "../styles/tokens.ts";

import {
  stackCategories,
  type AnimationKind,
  type ComponentKind,
  type StackCategory,
  type StackExample,
  type StackExplorerCodeHighlights,
  type StackExplorerCodeToken,
} from "./stack-explorer-content.tsx";

export let StackExplorer = clientEntry(
  import.meta.url,
  function StackExplorer(
    handle: Handle<{
      codeHighlights?: StackExplorerCodeHighlights;
    }>,
  ) {
    let categoryId: string = stackCategories[0].id;
    let exampleId: string = stackCategories[0].examples[0].id;
    let transitionLevel: "category" | "example" = "category";
    return () => {
      let category: StackCategory =
        stackCategories.find((candidate) => candidate.id === categoryId) ??
        stackCategories[0];
      let example: StackExample =
        category.examples.find((candidate) => candidate.id === exampleId) ??
        category.examples[0];
      let hasCategoryIntro = category.introTitle !== undefined;
      let showExampleCopy = category.showExampleCopy === true;
      let editorPreview = example.animation ?? example.component;
      let codePanel = (
        <CodePanel
          code={example.code}
          codeTokens={
            handle.props.codeHighlights?.[`${category.id}/${example.id}`]
          }
          filename={example.filename ?? "app.tsx"}
        />
      );
      let contentEntrance = animateEntrance({
        opacity: 0,
        transform: "translateY(8px)",
        ...spring("snappy"),
      });

      return (
        <section id="everything-you-need" mix={[sectionStyles]}>
          <div mix={[cardSlotStyles]}>
            <tabs.Context
              activeTab={category.id}
              onActiveTabChange={(nextCategoryId) => {
                let nextCategory = stackCategories.find(
                  (candidate) => candidate.id === nextCategoryId,
                );
                if (!nextCategory) return;

                transitionLevel = "category";
                categoryId = nextCategory.id;
                exampleId = nextCategory.examples[0].id;
                void handle.update();
              }}
            >
              <div data-home-card="" mix={[tabs.root(), cardStyles]}>
                <header mix={[headerStyles]}>
                  <h2 mix={[titleStyles]}>
                    Everything you need, all in a single package
                  </h2>
                </header>

                <div
                  aria-label="Remix stack layers"
                  mix={[tabs.list(), categoryTabsStyles]}
                >
                  {stackCategories.map((candidate) => {
                    return (
                      <button
                        key={candidate.id}
                        mix={[
                          tabs.tab({ name: candidate.id }),
                          categoryTabStyles,
                        ]}
                      >
                        {candidate.label}
                      </button>
                    );
                  })}
                </div>

                {stackCategories.map((categoryPanel) => (
                  <div
                    key={categoryPanel.id}
                    mix={[tabs.panel({ name: categoryPanel.id }), panelStyles]}
                  >
                    {categoryPanel.id === category.id ? (
                      <tabs.Context
                        activeTab={example.id}
                        onActiveTabChange={(nextExampleId) => {
                          if (
                            !category.examples.some(
                              (candidate) => candidate.id === nextExampleId,
                            )
                          ) {
                            return;
                          }

                          transitionLevel = "example";
                          exampleId = nextExampleId;
                          void handle.update();
                        }}
                      >
                        <div
                          key={category.id}
                          data-stack-category-content={category.id}
                          mix={[
                            tabs.root(),
                            ...(transitionLevel === "category"
                              ? [contentEntrance]
                              : []),
                          ]}
                        >
                          {hasCategoryIntro ? (
                            <div data-category-intro="" mix={[copyStyles]}>
                              <h3 mix={[exampleTitleStyles]}>
                                {category.introTitle}
                              </h3>
                              {category.introBody !== undefined ? (
                                <p mix={[exampleBodyStyles]}>
                                  {category.introBody}
                                </p>
                              ) : null}
                            </div>
                          ) : null}

                          <div
                            aria-label={`${category.label} examples`}
                            mix={[
                              tabs.list(),
                              exampleTabsStyles,
                              ...(hasCategoryIntro
                                ? [categoryIntroTabsStyles]
                                : []),
                            ]}
                          >
                            {category.examples.map((candidate) => {
                              return (
                                <button
                                  key={candidate.id}
                                  mix={[
                                    tabs.tab({ name: candidate.id }),
                                    exampleTabStyles,
                                  ]}
                                >
                                  {candidate.label}
                                </button>
                              );
                            })}
                          </div>

                          {category.examples.map((examplePanel) => (
                            <div
                              key={examplePanel.id}
                              mix={tabs.panel({ name: examplePanel.id })}
                            >
                              {examplePanel.id === example.id ? (
                                <div
                                  key={`${category.id}-${example.id}`}
                                  data-stack-example-content={example.id}
                                  mix={[
                                    exampleContentStyles,
                                    ...(editorPreview
                                      ? [editorExampleContentStyles]
                                      : []),
                                    ...(transitionLevel === "example"
                                      ? [contentEntrance]
                                      : []),
                                  ]}
                                >
                                  {showExampleCopy ? (
                                    <div mix={[featureSummaryStyles]}>
                                      <strong mix={[exampleFeatureLeadStyles]}>
                                        {example.title}
                                      </strong>
                                      <span mix={[featureSummaryBodyStyles]}>
                                        {example.body}
                                      </span>
                                    </div>
                                  ) : null}
                                  {editorPreview ? (
                                    <div mix={[editorContentStyles]}>
                                      <CodeChrome
                                        filename={example.filename ?? "app.tsx"}
                                      />
                                      <div mix={[editorPanesStyles]}>
                                        {example.animation ? (
                                          <AnimationPreview
                                            kind={example.animation}
                                            compact
                                            embedded
                                            editorPane
                                          />
                                        ) : (
                                          <ComponentPreview
                                            kind={example.component!}
                                            compact
                                            embedded
                                            editorPane
                                          />
                                        )}
                                        <div mix={[editorCodePaneStyles]}>
                                          <CodeBody
                                            code={example.code}
                                            codeTokens={
                                              handle.props.codeHighlights?.[
                                                `${category.id}/${example.id}`
                                              ]
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div mix={[codeColumnStyles]}>
                                      {codePanel}
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </tabs.Context>
                    ) : null}
                  </div>
                ))}
              </div>
            </tabs.Context>
          </div>
          <div
            aria-hidden="true"
            data-package-logos-panel="true"
            mix={[packageLogoStageStyles]}
          />
        </section>
      );
    };
  },
);

function ComponentPreview(
  handle: Handle<{
    kind: ComponentKind;
    compact?: boolean;
    embedded?: boolean;
    editorPane?: boolean;
  }>,
) {
  return () => (
    <div
      aria-hidden="true"
      data-stack-component={handle.props.kind}
      data-stack-editor-preview={handle.props.editorPane || undefined}
      inert={true}
      mix={[
        componentPreviewStyles,
        ...(handle.props.compact ? [compactComponentPreviewStyles] : []),
        ...(handle.props.embedded ? [embeddedComponentPreviewStyles] : []),
        ...(handle.props.editorPane ? [editorComponentPreviewStyles] : []),
      ]}
    >
      {handle.props.kind === "menus" ? (
        <MenusPreview />
      ) : handle.props.kind === "combobox" ? (
        <ComboboxPreview />
      ) : handle.props.kind === "select" ? (
        <SelectPreview />
      ) : handle.props.kind === "tabs" ? (
        <TabsPreview />
      ) : handle.props.kind === "accordion" ? (
        <AccordionPreview />
      ) : handle.props.kind === "popovers" ? (
        <PopoversPreview />
      ) : handle.props.kind === "toggle" ? (
        <TogglePreview />
      ) : (
        <ListboxPreview />
      )}
    </div>
  );
}

function TogglePreview() {
  return () => (
    <div aria-hidden="true" mix={[componentCanvasStyles, togglePreviewStyles]}>
      <div mix={[skeletonControlRowStyles]}>
        <span mix={[skeletonControlCopyStyles]}>
          <span mix={[formLabelStyles]}>Public release</span>
          <span mix={[formHintStyles]}>Visible in your catalogue</span>
        </span>
        <span mix={[skeletonToggleStyles]}>
          <span />
        </span>
      </div>
    </div>
  );
}

function SelectPreview() {
  return () => (
    <div aria-hidden="true" mix={[componentCanvasStyles, pickersPreviewStyles]}>
      <div mix={[skeletonFieldStyles]}>
        <span mix={[formLabelStyles]}>Release format</span>
        <span mix={[pickerControlStyles]}>
          <span>Vinyl</span>
          <span mix={[pickerChevronStyles]}>⌄</span>
        </span>
      </div>
    </div>
  );
}

function ComboboxPreview() {
  return () => (
    <div aria-hidden="true" mix={[componentCanvasStyles, pickersPreviewStyles]}>
      <div mix={[skeletonFieldStyles]}>
        <span mix={[formLabelStyles]}>Artist</span>
        <span mix={[pickerControlStyles, comboboxPreviewStyles]}>
          Search artists
        </span>
      </div>
      <div mix={[comboboxOptionsPreviewStyles]}>
        <span>Michael Jackson</span>
        <span>Quincy Jones</span>
      </div>
    </div>
  );
}

function ListboxPreview() {
  return () => (
    <div aria-hidden="true" mix={[componentCanvasStyles, pickersPreviewStyles]}>
      <div mix={[skeletonFieldStyles]}>
        <span mix={[formLabelStyles]}>Genre</span>
        <div mix={[pickerOptionListStyles]}>
          <span>Pop</span>
          <span>R&amp;B</span>
          <span>Disco</span>
        </div>
      </div>
    </div>
  );
}

function TabsPreview() {
  return () => (
    <div
      aria-hidden="true"
      mix={[componentCanvasStyles, structurePreviewStyles]}
    >
      <div mix={[tabsPreviewStyles]}>
        <span mix={[staticTabStyles, staticTabActiveStyles]}>Overview</span>
        <span mix={[staticTabStyles]}>Tracks</span>
      </div>
      <div mix={[navigationContentStyles]}>
        <span mix={[skeletonLineStyles]} />
        <span mix={[skeletonLineStyles, skeletonLineShortStyles]} />
      </div>
    </div>
  );
}

function AccordionPreview() {
  return () => (
    <div
      aria-hidden="true"
      mix={[componentCanvasStyles, disclosurePreviewStyles]}
    >
      <div mix={[accordionPreviewStyles]}>
        <span mix={[accordionHeaderStyles]}>
          <span>Credits</span>
          <span>⌄</span>
        </span>
        <span mix={[structureLinesStyles]}>
          <span mix={[skeletonLineStyles]} />
          <span mix={[skeletonLineStyles, skeletonLineShortStyles]} />
        </span>
      </div>
      <div mix={[accordionPreviewStyles]}>
        <span mix={[accordionHeaderStyles]}>
          <span>Release details</span>
          <span>›</span>
        </span>
      </div>
    </div>
  );
}

function MenusPreview() {
  return () => (
    <div
      aria-hidden="true"
      mix={[componentCanvasStyles, overlaysPreviewStyles]}
    >
      <div mix={[skeletonToolbarStyles]}>
        <span mix={[toolbarMarkStyles]} />
        <span mix={[toolbarTitleStyles]}>Thriller</span>
        <span mix={[toolbarMenuButtonStyles]}>•••</span>
      </div>
      <div mix={[staticMenuStyles]}>
        <span>Edit album</span>
        <span>Share album</span>
        <span mix={[staticSubmenuRowStyles]}>✓&nbsp; Favourite</span>
      </div>
      <div mix={[overlayContentStyles]}>
        <span mix={[overlayHeroStyles]} />
        <span mix={[structureLinesStyles]}>
          <span mix={[skeletonLineStyles]} />
          <span mix={[skeletonLineStyles]} />
          <span mix={[skeletonLineStyles, skeletonLineShortStyles]} />
        </span>
      </div>
    </div>
  );
}

function PopoversPreview() {
  return () => (
    <div aria-hidden="true" mix={[componentCanvasStyles, popoverPreviewStyles]}>
      <div mix={[albumPreviewHeaderStyles]}>
        <span mix={[albumPreviewArtStyles]} />
        <span>
          <strong>Thriller</strong>
          <small>Michael Jackson</small>
        </span>
      </div>
      <div mix={[trackListPreviewStyles]}>
        <span>
          <i>01</i>Wanna Be Startin&apos; Somethin&apos;<em>6:03</em>
        </span>
        <span mix={[activeTrackPreviewStyles]}>
          <i>05</i>Beat It<em>4:17</em>
        </span>
        <span>
          <i>06</i>Billie Jean<em>4:54</em>
        </span>
      </div>
      <div mix={[staticPopoverStyles]}>
        <strong>Beat It</strong>
        <span>Track details</span>
        <span>4:17 · Epic Records</span>
      </div>
    </div>
  );
}

function AnimationPreview(
  handle: Handle<{
    kind: AnimationKind;
    compact?: boolean;
    embedded?: boolean;
    editorPane?: boolean;
  }>,
) {
  let showPresenceItem = true;
  let animatePresence = false;
  let presenceCycle = 0;
  let order = [0, 1, 2, 3];
  let expanded = false;
  let cycle = 0;
  let previewElement: HTMLElement | null = null;
  let observer: IntersectionObserver | null = null;
  let cycleTimer: ReturnType<typeof setTimeout> | null = null;
  let presenceTimer: ReturnType<typeof setTimeout> | null = null;

  handle.queueTask(() => {
    animatePresence = true;
  });

  function stop() {
    if (cycleTimer !== null) clearTimeout(cycleTimer);
    if (presenceTimer !== null) clearTimeout(presenceTimer);
    cycleTimer = null;
    presenceTimer = null;
  }

  function schedule(delay = 1600) {
    if (cycleTimer !== null) clearTimeout(cycleTimer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    cycleTimer = setTimeout(async () => {
      cycleTimer = null;
      order = [...order.slice(1), order[0]];
      expanded = !expanded;
      cycle++;

      if (handle.props.kind === "presence") showPresenceItem = false;
      let signal = await handle.update();
      if (signal.aborted || !previewElement) return;

      if (handle.props.kind === "presence") {
        presenceTimer = setTimeout(async () => {
          presenceTimer = null;
          presenceCycle++;
          showPresenceItem = true;
          await handle.update();
        }, 700);
      }

      schedule();
    }, delay);
  }

  handle.signal.addEventListener("abort", () => {
    stop();
    observer?.disconnect();
  });

  return () => (
    <div
      aria-label={`${handle.props.kind} animation preview`}
      mix={[
        animationPreviewStyles,
        ...(handle.props.compact ? [compactAnimationPreviewStyles] : []),
        ...(handle.props.embedded ? [embeddedAnimationPreviewStyles] : []),
        ...(handle.props.editorPane ? [editorAnimationPreviewStyles] : []),
        ref((node) => {
          previewElement = node;
          if (!node || observer) return;
          observer = new IntersectionObserver(
            ([entry]) => {
              if (entry?.isIntersecting) schedule(350);
              else stop();
            },
            { threshold: 0.2 },
          );
          observer.observe(node);
        }),
      ]}
    >
      {handle.props.kind === "presence" ? (
        <div data-stack-animation="presence" mix={[presenceSlotStyles]}>
          {showPresenceItem && (
            <PresencePreviewCard
              presenceKey={`stack-presence-${presenceCycle}`}
              animate={animatePresence}
            />
          )}
        </div>
      ) : handle.props.kind === "layout" ? (
        <div data-stack-animation="layout" mix={[layoutGridStyles]}>
          {order.map((item) => (
            <span
              key={`stack-layout-${item}`}
              mix={[
                layoutItemStyles,
                animateLayout({
                  size: false,
                  ...spring({ duration: 620, bounce: 0.18 }),
                }),
              ]}
              style={{ opacity: 1 - item * 0.12 }}
            />
          ))}
        </div>
      ) : handle.props.kind === "spring" ? (
        <div
          data-stack-animation="spring"
          mix={[springShapeStyles]}
          style={{
            width: expanded ? "176px" : "84px",
            height: expanded ? "72px" : "84px",
            borderRadius: expanded ? "22px" : "50%",
            transition: spring.transition(
              ["width", "height", "border-radius"],
              { duration: 600, bounce: 0.55 },
            ),
          }}
        />
      ) : (
        <TweenPreview cycle={cycle} />
      )}
    </div>
  );
}

function PresencePreviewCard(
  handle: Handle<{ presenceKey: string; animate: boolean }>,
) {
  return () => (
    <div
      key={handle.props.presenceKey}
      mix={[
        presenceCardStyles,
        animateEntrance(
          handle.props.animate && {
            opacity: 0,
            transform: "scale(.84)",
            ...spring("snappy"),
          },
        ),
        animateExit({
          opacity: 0,
          transform: "scale(.84)",
          ...spring(),
        }),
      ]}
    >
      <span mix={[presenceIconStyles]}>
        <span mix={[presenceIconCoreStyles]} />
      </span>
      <span mix={[presenceContentStyles]}>
        <span mix={[presenceLineStyles]} />
        <span mix={[presenceLineStyles, presenceLineShortStyles]} />
      </span>
    </div>
  );
}

function TweenPreview(handle: Handle<{ cycle: number }>) {
  let currentValue = 0;
  let queuedCycle = -1;
  let animationFrame = 0;

  handle.signal.addEventListener("abort", () =>
    cancelAnimationFrame(animationFrame),
  );

  return () => {
    if (queuedCycle !== handle.props.cycle) {
      queuedCycle = handle.props.cycle;
      let targetValue = handle.props.cycle % 2 === 0 ? 0 : 100;

      handle.queueTask(() => {
        let setValue = (value: number) => {
          currentValue = value;
          handle.update();
        };

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setValue(targetValue);
          return;
        }

        cancelAnimationFrame(animationFrame);
        let animation = tween({
          from: currentValue,
          to: targetValue,
          duration: 650,
          curve: easings.easeInOut,
        });
        animation.next();

        let tick = (time: number) => {
          if (handle.signal.aborted) return;
          let result = animation.next(time);
          setValue(result.value);
          if (!result.done) animationFrame = requestAnimationFrame(tick);
        };

        animationFrame = requestAnimationFrame(tick);
      });
    }

    return (
      <div data-stack-animation="tween" mix={[tweenDemoStyles]}>
        <output mix={[tweenValueStyles]}>{Math.round(currentValue)}%</output>
        <div mix={[tweenTrackStyles]}>
          <span
            mix={[tweenFillStyles]}
            style={{ transform: `scaleX(${currentValue / 100})` }}
          />
          <span
            mix={[tweenMarkerStyles]}
            style={{ left: `${currentValue}%` }}
          />
        </div>
      </div>
    );
  };
}

function CodePanel(
  handle: Handle<{
    code: string;
    codeTokens?: readonly StackExplorerCodeToken[];
    filename: string;
  }>,
) {
  return () => (
    <div mix={[codeShellStyles]}>
      <CodeChrome filename={handle.props.filename} />
      <CodeBody code={handle.props.code} codeTokens={handle.props.codeTokens} />
    </div>
  );
}

function CodeChrome(handle: Handle<{ filename: string }>) {
  return () => (
    <div mix={[codeChromeStyles]}>
      <span mix={[windowDotStyles]} />
      <span mix={[windowDotStyles]} />
      <span mix={[windowDotStyles]} />
      <span mix={[filenameStyles]}>{handle.props.filename}</span>
    </div>
  );
}

function CodeBody(
  handle: Handle<{
    code: string;
    codeTokens?: readonly StackExplorerCodeToken[];
  }>,
) {
  return () => (
    <pre mix={[codeStyles]}>
      <code>
        {handle.props.codeTokens
          ? handle.props.codeTokens.map((token, index) =>
              token[1] ? (
                <span key={index} style={{ color: token[1] }}>
                  {token[0]}
                </span>
              ) : (
                token[0]
              ),
            )
          : handle.props.code}
      </code>
    </pre>
  );
}

const sectionStyles = css({
  width: pageMaxWidth,
  minHeight: "100vh",
  scrollMarginTop: "clamp(72px, 10vh, 112px)",
  margin: "0 auto",
  padding: "128px 0",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  [breakpointMedia.md]: { padding: "160px 0" },
});

const cardStyles = css({
  width: "min(1040px, 100%)",
  margin: "0 auto",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "28px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  background: "rgba(0, 0, 0, 0.58)",
  overflow: "hidden",
});

const cardSlotStyles = css({
  width: "100%",
  minHeight: "1500px",
  [breakpointMedia.md]: { minHeight: "1300px" },
});

const headerStyles = css({
  padding: "36px 24px",
  [breakpointMedia.md]: { padding: "48px" },
});

const titleStyles = css({
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: colors.fg,
  fontSize: "32px",
  lineHeight: "1.04",
  letterSpacing: "-0.025em",
  textShadow: glowWhite,
  textWrap: "balance",
  ...textBoxTrim,
  [breakpointMedia.md]: { fontSize: "clamp(36px, 4vw, 54px)" },
});

const scrollableTabs = {
  display: "flex",
  overflowX: "auto",
  scrollbarWidth: "none",
  WebkitOverflowScrolling: "touch",
  "&::-webkit-scrollbar": { display: "none" },
} as const;

const categoryTabsStyles = css({
  ...scrollableTabs,
  padding: "0 12px",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  background: "rgba(0, 0, 0, 0.18)",
  [breakpointMedia.sm]: { padding: "0 24px" },
});

const categoryTabStyles = css({
  position: "relative",
  flex: "1 0 auto",
  minWidth: "96px",
  height: "58px",
  padding: "0 18px",
  border: "0",
  background: "transparent",
  color: "rgba(255, 255, 255, 0.52)",
  fontFamily: theme.fontFamily.mono,
  fontWeight: theme.fontWeight.medium,
  fontSize: "12px",
  lineHeight: "1",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "color 160ms ease, background 160ms ease",
  "&::after": {
    content: "''",
    position: "absolute",
    left: "18px",
    right: "18px",
    bottom: "0",
    height: "2px",
    background: "transparent",
  },
  "&:hover": { color: "#ffffff", background: "rgba(255, 255, 255, 0.025)" },
  "&:focus-visible": {
    outline: "2px solid var(--brand-cycle)",
    outlineOffset: "-4px",
  },
  '&[data-state="active"]': {
    color: "#ffffff",
    background: "rgba(255, 255, 255, 0.035)",
    "&::after": {
      background: "var(--brand-cycle, #7ce95a)",
      boxShadow: "0 0 12px var(--brand-cycle, #7ce95a)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

const panelStyles = css({
  padding: "24px",
  [breakpointMedia.md]: { padding: "32px 48px 48px" },
});

const exampleTabsStyles = css({
  ...scrollableTabs,
  gap: "8px",
  margin: "-4px -8px 20px",
  padding: "4px 8px",
  [breakpointMedia.md]: { marginBottom: "28px" },
});

const categoryIntroTabsStyles = css({
  marginTop: "32px",
  marginRight: "-24px",
  marginLeft: "-24px",
  paddingRight: "0",
  paddingLeft: "24px",
  scrollPaddingInlineStart: "24px",
  [breakpointMedia.md]: {
    marginTop: "36px",
    marginRight: "-48px",
    marginLeft: "-48px",
    paddingLeft: "48px",
    scrollPaddingInlineStart: "48px",
  },
});

const exampleTabStyles = css({
  display: "grid",
  placeItems: "center",
  flex: "0 0 auto",
  minHeight: "38px",
  padding: "0 14px 1px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "999px",
  background: "rgba(255, 255, 255, 0.025)",
  color: "rgba(255, 255, 255, 0.56)",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.medium,
  fontSize: "13px",
  lineHeight: "1",
  cursor: "pointer",
  transition:
    "border-color 160ms ease, background 160ms ease, color 160ms ease",
  "&:hover": { color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.22)" },
  "&:focus-visible": {
    outline: "2px solid var(--brand-cycle)",
    outlineOffset: "2px",
  },
  '&[data-state="active"]': {
    color: "#ffffff",
    borderColor: "color-mix(in srgb, var(--brand-cycle) 52%, transparent)",
    background:
      "color-mix(in srgb, var(--brand-cycle) 12%, rgba(255,255,255,.035))",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

const exampleContentStyles = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "24px",
  [breakpointMedia.md]: {
    gridTemplateColumns: "minmax(0, .65fr) minmax(0, 1.35fr)",
    gap: "42px",
  },
  "& > div:last-child": { gap: "14px" },
  "& pre": { minHeight: "0" },
});

const editorExampleContentStyles = css({
  [breakpointMedia.md]: {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "28px",
  },
});

const copyStyles = css({
  display: "flex",
  minWidth: "0",
  flexDirection: "column",
});
const codeColumnStyles = css({
  display: "grid",
  minWidth: "0",
  alignContent: "start",
  gap: "24px",
});
const editorContentStyles = css({
  display: "grid",
  minWidth: "0",
  gap: "0",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "18px",
  background: "rgba(1, 4, 10, 0.76)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.025)",
});
const editorPanesStyles = css({
  display: "grid",
  minWidth: "0",
  "& > :first-child": { borderBottom: "1px solid rgba(255,255,255,.1)" },
  [breakpointMedia.md]: {
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, .8fr)",
    alignItems: "stretch",
    "& > :first-child": {
      gridColumn: "2",
      borderBottom: "0",
      borderLeft: "1px solid rgba(255,255,255,.1) !important",
    },
    "& > :last-child": { gridColumn: "1", gridRow: "1" },
  },
});
const featureSummaryStyles = css({
  display: "flex",
  minWidth: "0",
  flexDirection: "column",
});
const featureSummaryBodyStyles = css({
  color: "rgba(255, 255, 255, 0.7)",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  fontSize: "15px",
  lineHeight: "1.55",
});
const editorCodePaneStyles = css({ minWidth: "0" });
const exampleTitleStyles = css({
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: "#ffffff",
  fontSize: "clamp(23px, 3vw, 32px)",
  lineHeight: "1.12",
  letterSpacing: "-0.02em",
  textWrap: "balance",
});
const exampleBodyStyles = css({
  margin: "20px 0 0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "15px",
  lineHeight: "1.55",
});

const exampleFeatureLeadStyles = css({
  display: "block",
  marginBottom: "12px",
  color: "#ffffff",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  fontSize: "18px",
  lineHeight: "1.3",
});

const componentPreviewStyles = css({
  position: "relative",
  display: "grid",
  minHeight: "230px",
  marginTop: "28px",
  padding: "22px",
  boxSizing: "border-box",
  placeItems: "center",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "18px",
  background:
    "radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--brand-cycle) 13%, transparent), transparent 60%), rgba(0,0,0,.26)",
  overflow: "hidden",
  pointerEvents: "none",
  userSelect: "none",
});
const compactComponentPreviewStyles = css({ marginTop: "0 !important" });
const embeddedComponentPreviewStyles = css({
  border: "0 !important",
  borderRadius: "0 !important",
});
const editorComponentPreviewStyles = css({
  [breakpointMedia.md]: {
    alignSelf: "stretch",
    height: "100%",
    borderLeft: "1px solid rgba(255,255,255,.1) !important",
  },
});
const componentCanvasStyles = css({
  width: "min(296px, 100%)",
  boxSizing: "border-box",
  border:
    "1px solid color-mix(in srgb, var(--brand-cycle) 24%, rgba(255,255,255,.1))",
  borderRadius: "16px",
  background:
    "linear-gradient(145deg, color-mix(in srgb, var(--brand-cycle) 6%, rgba(255,255,255,.045)), rgba(3,8,17,.92))",
  boxShadow: "0 20px 48px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.04)",
  colorScheme: "dark",
});
const togglePreviewStyles = css({
  display: "grid",
  gap: "13px",
  padding: "18px",
});
const skeletonFieldStyles = css({
  display: "grid",
  gap: "7px",
});
const formLabelStyles = css({
  color: "rgba(255,255,255,.76)",
  fontFamily: theme.fontFamily.sans,
  fontSize: "11px",
  lineHeight: "1.2",
});
const formHintStyles = css({
  color: "rgba(255,255,255,.42)",
  fontFamily: theme.fontFamily.sans,
  fontSize: "10px",
  lineHeight: "1.25",
});
const skeletonControlRowStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "18px",
  paddingTop: "2px",
});
const skeletonControlCopyStyles = css({
  display: "grid",
  width: "128px",
  gap: "4px",
});
const skeletonToggleStyles = css({
  position: "relative",
  display: "block",
  width: "34px",
  height: "20px",
  flexShrink: "0",
  borderRadius: "999px",
  background:
    "color-mix(in srgb, var(--brand-cycle) 42%, rgba(255,255,255,.09))",
  boxShadow:
    "inset 0 0 0 1px color-mix(in srgb, var(--brand-cycle) 32%, transparent), 0 0 14px color-mix(in srgb, var(--brand-cycle) 18%, transparent)",
  "& > span": {
    position: "absolute",
    top: "3px",
    right: "3px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "rgba(255,255,255,.9)",
  },
});
const skeletonLineStyles = css({
  display: "block",
  width: "100%",
  height: "5px",
  borderRadius: "999px",
  background: "rgba(255,255,255,.28)",
});
const skeletonLineShortStyles = css({
  width: "62%",
  background: "rgba(255,255,255,.15)",
});
const pickersPreviewStyles = css({
  display: "grid",
  gap: "14px",
  padding: "20px",
});
const pickerControlStyles = css({
  display: "flex",
  minHeight: "34px",
  padding: "0 11px",
  boxSizing: "border-box",
  alignItems: "center",
  justifyContent: "space-between",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "8px",
  background:
    "color-mix(in srgb, var(--brand-cycle) 5%, rgba(255,255,255,.045))",
  color: "rgba(255,255,255,.72)",
  fontFamily: theme.fontFamily.sans,
  fontSize: "11px",
});
const comboboxPreviewStyles = css({
  justifyContent: "flex-start",
  color: "rgba(255,255,255,.34)",
});
const comboboxOptionsPreviewStyles = css({
  display: "grid",
  gap: "2px",
  padding: "5px",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: "8px",
  background: "rgba(7,12,21,.92)",
  "& > span": {
    padding: "7px 8px",
    borderRadius: "5px",
    color: "rgba(255,255,255,.58)",
    fontFamily: theme.fontFamily.sans,
    fontSize: "10px",
  },
  "& > span:first-child": {
    background: "color-mix(in srgb, var(--brand-cycle) 12%, transparent)",
    color: "rgba(255,255,255,.86)",
  },
});
const pickerChevronStyles = css({
  color: "rgba(255,255,255,.46)",
  fontSize: "13px",
});
const pickerOptionListStyles = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "5px",
  "& > span": {
    padding: "6px 4px",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: "5px",
    color: "rgba(255,255,255,.48)",
    fontFamily: theme.fontFamily.sans,
    fontSize: "9px",
    textAlign: "center",
  },
  "& > span:nth-child(2)": {
    borderColor:
      "color-mix(in srgb, var(--brand-cycle) 42%, rgba(255,255,255,.1))",
    background: "color-mix(in srgb, var(--brand-cycle) 13%, transparent)",
    color: "rgba(255,255,255,.82)",
  },
});
const structurePreviewStyles = css({
  padding: "16px",
});
const tabsPreviewStyles = css({
  display: "flex",
  width: "fit-content",
  marginBottom: "11px",
  padding: "3px",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: "10px",
  background: "rgba(0,0,0,.24)",
});
const staticTabStyles = css({
  display: "grid",
  minWidth: "68px",
  height: "26px",
  placeItems: "center",
  borderRadius: "7px",
  color: "rgba(255,255,255,.42)",
  fontFamily: theme.fontFamily.sans,
  fontSize: "10px",
});
const staticTabActiveStyles = css({
  background:
    "color-mix(in srgb, var(--brand-cycle) 10%, rgba(255,255,255,.07))",
  color: "rgba(255,255,255,.84)",
});
const navigationContentStyles = css({
  display: "grid",
  gap: "8px",
  padding: "14px 12px",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: "11px",
  background: "rgba(255,255,255,.025)",
});
const disclosurePreviewStyles = css({
  display: "grid",
  gap: "9px",
  padding: "16px",
});
const accordionPreviewStyles = css({
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: "11px",
  background: "rgba(255,255,255,.025)",
  overflow: "hidden",
});
const accordionHeaderStyles = css({
  display: "flex",
  minHeight: "34px",
  padding: "0 12px",
  alignItems: "center",
  justifyContent: "space-between",
  color: "rgba(255,255,255,.78)",
  fontFamily: theme.fontFamily.sans,
  fontSize: "11px",
});
const structureLinesStyles = css({
  display: "grid",
  gap: "8px",
  padding: "4px 12px 13px",
});
const overlaysPreviewStyles = css({
  position: "relative",
  minHeight: "176px",
  overflow: "hidden",
});
const skeletonToolbarStyles = css({
  display: "grid",
  height: "43px",
  padding: "0 10px 0 12px",
  boxSizing: "border-box",
  gridTemplateColumns: "24px minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "10px",
  borderBottom: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.025)",
});
const toolbarMarkStyles = css({
  width: "22px",
  height: "22px",
  borderRadius: "7px",
  background:
    "color-mix(in srgb, var(--brand-cycle) 28%, rgba(255,255,255,.04))",
  boxShadow:
    "inset 0 0 0 1px color-mix(in srgb, var(--brand-cycle) 30%, transparent)",
});
const toolbarTitleStyles = css({
  color: "rgba(255,255,255,.66)",
  fontFamily: theme.fontFamily.sans,
  fontSize: "11px",
});
const toolbarMenuButtonStyles = css({
  display: "grid",
  width: "32px",
  height: "26px",
  padding: "0",
  boxSizing: "border-box",
  placeItems: "center",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "8px",
  background: "rgba(255,255,255,.04)",
  color: "rgba(255,255,255,.72)",
  fontFamily: theme.fontFamily.mono,
  fontSize: "9px",
});
const staticMenuStyles = css({
  position: "absolute",
  zIndex: "2",
  top: "35px",
  right: "10px",
  display: "grid",
  width: "112px",
  padding: "5px",
  boxSizing: "border-box",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "10px",
  background: "rgba(18,18,18,.97)",
  boxShadow: "0 16px 32px rgba(0,0,0,.42)",
  "& > span": {
    display: "flex",
    height: "25px",
    padding: "0 7px",
    alignItems: "center",
    borderRadius: "6px",
    color: "rgba(255,255,255,.7)",
    fontFamily: theme.fontFamily.sans,
    fontSize: "10px",
  },
  "& > span:first-child": {
    background:
      "color-mix(in srgb, var(--brand-cycle) 13%, rgba(255,255,255,.035))",
    color: "rgba(255,255,255,.9)",
  },
});
const staticSubmenuRowStyles = css({
  justifyContent: "space-between",
});
const popoverPreviewStyles = css({
  position: "relative",
  display: "grid",
  alignContent: "start",
  minHeight: "176px",
  overflow: "hidden",
});
const albumPreviewHeaderStyles = css({
  display: "grid",
  gridTemplateColumns: "42px minmax(0, 1fr)",
  alignItems: "center",
  gap: "10px",
  padding: "14px",
  borderBottom: "1px solid rgba(255,255,255,.08)",
  "& > span:last-child": { display: "grid", gap: "3px" },
  "& strong": {
    color: "rgba(255,255,255,.8)",
    fontFamily: theme.fontFamily.sans,
    fontSize: "11px",
    fontWeight: theme.fontWeight.medium,
  },
  "& small": {
    color: "rgba(255,255,255,.43)",
    fontFamily: theme.fontFamily.sans,
    fontSize: "9px",
  },
});
const albumPreviewArtStyles = css({
  display: "block",
  width: "42px",
  height: "42px",
  borderRadius: "6px",
  background:
    "linear-gradient(145deg, color-mix(in srgb, var(--brand-cycle) 32%, rgba(255,255,255,.12)), rgba(255,255,255,.025))",
  boxShadow:
    "inset 0 0 0 1px color-mix(in srgb, var(--brand-cycle) 24%, rgba(255,255,255,.06))",
});
const trackListPreviewStyles = css({
  display: "grid",
  padding: "8px",
  "& > span": {
    display: "grid",
    minHeight: "28px",
    padding: "0 7px",
    gridTemplateColumns: "20px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: "6px",
    borderRadius: "5px",
    color: "rgba(255,255,255,.56)",
    fontFamily: theme.fontFamily.sans,
    fontSize: "9px",
  },
  "& i, & em": {
    color: "rgba(255,255,255,.34)",
    fontFamily: theme.fontFamily.mono,
    fontSize: "8px",
    fontStyle: "normal",
  },
  "& em": { justifySelf: "end" },
});
const activeTrackPreviewStyles = css({
  background:
    "color-mix(in srgb, var(--brand-cycle) 12%, rgba(255,255,255,.04))",
  color: "rgba(255,255,255,.88) !important",
  "& i": { color: "var(--brand-cycle, #7ce95a) !important" },
});
const staticPopoverStyles = css({
  position: "absolute",
  zIndex: "2",
  top: "76px",
  right: "12px",
  display: "grid",
  width: "150px",
  gap: "6px",
  padding: "12px",
  boxSizing: "border-box",
  border: "1px solid rgba(255,255,255,.14)",
  borderRadius: "10px",
  background: "rgba(12,17,26,.98)",
  boxShadow: "0 16px 32px rgba(0,0,0,.48)",
  fontFamily: theme.fontFamily.sans,
  fontSize: "10px",
  "& > strong": {
    color: "rgba(255,255,255,.88)",
    fontWeight: theme.fontWeight.medium,
  },
  "& > span": { color: "rgba(255,255,255,.5)" },
});
const overlayContentStyles = css({
  display: "grid",
  gridTemplateColumns: "76px minmax(0, 1fr)",
  alignItems: "center",
  gap: "16px",
  padding: "22px",
});
const overlayHeroStyles = css({
  width: "76px",
  height: "76px",
  borderRadius: "14px",
  background:
    "linear-gradient(145deg, color-mix(in srgb, var(--brand-cycle) 22%, rgba(255,255,255,.04)), rgba(255,255,255,.02))",
  boxShadow:
    "inset 0 0 0 1px color-mix(in srgb, var(--brand-cycle) 24%, rgba(255,255,255,.05))",
});
const animationPreviewStyles = css({
  position: "relative",
  display: "grid",
  minHeight: "190px",
  marginTop: "28px",
  padding: "24px",
  boxSizing: "border-box",
  placeItems: "center",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "18px",
  background:
    "radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--brand-cycle) 13%, transparent), transparent 60%), rgba(0,0,0,.26)",
  overflow: "hidden",
});
const compactAnimationPreviewStyles = css({ marginTop: "0 !important" });
const embeddedAnimationPreviewStyles = css({
  border: "0 !important",
  borderRadius: "0 !important",
});
const editorAnimationPreviewStyles = css({
  [breakpointMedia.md]: {
    alignSelf: "stretch",
    height: "100%",
    borderLeft: "1px solid rgba(255,255,255,.1) !important",
  },
});
const presenceSlotStyles = css({
  display: "grid",
  width: "min(250px, 100%)",
  height: "92px",
  placeItems: "center",
});
const presenceCardStyles = css({
  display: "grid",
  width: "100%",
  height: "82px",
  boxSizing: "border-box",
  gridTemplateColumns: "42px minmax(0, 1fr)",
  alignItems: "center",
  gap: "14px",
  padding: "0 18px",
  border:
    "1px solid color-mix(in srgb, var(--brand-cycle) 28%, rgba(255,255,255,.12))",
  borderRadius: "16px",
  background:
    "linear-gradient(135deg, color-mix(in srgb, var(--brand-cycle) 8%, rgba(255,255,255,.055)), rgba(255,255,255,.025))",
  boxShadow: "0 18px 46px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.04)",
  transformOrigin: "center",
});
const presenceIconStyles = css({
  display: "grid",
  width: "42px",
  height: "42px",
  placeItems: "center",
  borderRadius: "13px",
  background: "color-mix(in srgb, var(--brand-cycle) 14%, rgba(0,0,0,.4))",
  boxShadow:
    "inset 0 0 0 1px color-mix(in srgb, var(--brand-cycle) 32%, transparent)",
});
const presenceIconCoreStyles = css({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "var(--brand-cycle, #7ce95a)",
  boxShadow: "0 0 16px color-mix(in srgb, var(--brand-cycle) 70%, transparent)",
});
const presenceContentStyles = css({
  display: "flex",
  minWidth: "0",
  flexDirection: "column",
  gap: "10px",
});
const presenceLineStyles = css({
  width: "100%",
  height: "5px",
  borderRadius: "999px",
  background: "rgba(255,255,255,.34)",
});
const presenceLineShortStyles = css({
  width: "64%",
  background: "rgba(255,255,255,.18)",
});
const layoutGridStyles = css({
  display: "grid",
  width: "204px",
  gridTemplateColumns: "repeat(2, 94px)",
  gap: "16px",
});
const layoutItemStyles = css({
  display: "block",
  height: "60px",
  border:
    "1px solid color-mix(in srgb, var(--brand-cycle) 48%, rgba(255,255,255,.12))",
  borderRadius: "16px",
  background: "color-mix(in srgb, var(--brand-cycle) 30%, rgba(7,16,31,.92))",
  boxShadow:
    "0 12px 25px rgba(0,0,0,.22), 0 0 24px color-mix(in srgb, var(--brand-cycle) 14%, transparent)",
});
const springShapeStyles = css({
  background:
    "color-mix(in srgb, var(--brand-cycle) 23%, rgba(255,255,255,.035))",
  border:
    "1px solid color-mix(in srgb, var(--brand-cycle) 56%, rgba(255,255,255,.12))",
  boxShadow: "0 0 42px color-mix(in srgb, var(--brand-cycle) 18%, transparent)",
});
const tweenDemoStyles = css({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
});
const tweenValueStyles = css({
  minWidth: "3.2ch",
  marginBottom: "26px",
  color: "#fff",
  fontFamily: theme.fontFamily.mono,
  fontSize: "38px",
  lineHeight: "1",
  letterSpacing: "-.05em",
  textAlign: "right",
  textShadow:
    "0 0 24px color-mix(in srgb, var(--brand-cycle) 42%, transparent)",
});
const tweenTrackStyles = css({
  position: "relative",
  width: "min(220px, 86%)",
  height: "4px",
  borderRadius: "999px",
  background: "rgba(255,255,255,.1)",
});
const tweenFillStyles = css({
  position: "absolute",
  inset: "0",
  borderRadius: "inherit",
  background: "var(--brand-cycle, #7ce95a)",
  boxShadow: "0 0 16px color-mix(in srgb, var(--brand-cycle) 42%, transparent)",
  transformOrigin: "left center",
});
const tweenMarkerStyles = css({
  position: "absolute",
  top: "50%",
  width: "16px",
  height: "16px",
  border: "2px solid rgba(5,11,22,.85)",
  borderRadius: "50%",
  background: "var(--brand-cycle, #7ce95a)",
  boxShadow: "0 0 18px color-mix(in srgb, var(--brand-cycle) 50%, transparent)",
  transform: "translate(-50%, -50%)",
});
const codeShellStyles = css({
  minWidth: "0",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "18px",
  background: "rgba(1, 4, 10, 0.76)",
  overflow: "hidden",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.025)",
});
const codeChromeStyles = css({
  display: "flex",
  height: "42px",
  alignItems: "center",
  gap: "6px",
  padding: "0 16px",
  borderBottom: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.02)",
});
const windowDotStyles = css({
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "rgba(255,255,255,.2)",
});
const filenameStyles = css({
  marginLeft: "8px",
  color: "rgba(255,255,255,.4)",
  fontFamily: theme.fontFamily.mono,
  fontSize: "10px",
});
const codeStyles = css({
  minHeight: "280px",
  margin: "0",
  padding: "22px 18px 26px",
  boxSizing: "border-box",
  overflowX: "auto",
  color: "rgba(255,255,255,.86)",
  fontFamily: theme.fontFamily.mono,
  fontWeight: theme.fontWeight.normal,
  fontSize: "12px",
  lineHeight: "1.65",
  tabSize: "2",
  [breakpointMedia.sm]: { padding: "26px", fontSize: "13px" },
});

const packageLogoStageStyles = css({
  width: "min(720px, 100%)",
  height: "680px",
  margin: "280px auto 0",
  flexShrink: "0",
  [breakpointMedia.md]: {
    height: "clamp(720px, 64vw, 820px)",
    marginTop: "320px",
  },
});
