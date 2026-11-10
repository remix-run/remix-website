import { expect } from "remix/assert";
import {
  afterEach,
  beforeEach,
  describe,
  it,
  type TestContext,
} from "remix/test";
import { render } from "remix/component/test";

import { Jam2026PhotoViewerFrame } from "./photo-viewer.tsx";
import { jam2026ModalConfig } from "./modal-contract.ts";
import type { PhotoViewerState, ViewerPhoto } from "./shopify-photo.ts";
import { routes } from "../../../../routes.ts";

let photos: ViewerPhoto[] = ["DSC01", "DSC02", "DSC03"].map((slug) => ({
  url: `https://cdn.shopify.com/files/${slug}.jpg`,
  filename: `${slug}.jpg`,
  slug,
  tilt: 1.5,
  width: 1200,
  height: 800,
}));

function viewerAt(index: number): PhotoViewerState {
  return {
    index,
    count: photos.length,
    photo: photos[index],
    previous: photos[(index + photos.length - 1) % photos.length],
    next: photos[(index + 1) % photos.length],
    timeline: [-1, 0, 1].map((offset) => ({
      ...photos[(index + offset + photos.length) % photos.length],
      current: offset === 0,
    })),
  };
}

describe("Jam2026PhotoViewerFrame", () => {
  let originalHead: string;
  let originalOverflow: string;
  let originalScrollbarGutter: string;

  beforeEach(() => {
    originalHead = document.head.innerHTML;
    originalOverflow = document.documentElement.style.overflow;
    originalScrollbarGutter = document.documentElement.style.scrollbarGutter;
  });

  afterEach(() => {
    document.head.innerHTML = originalHead;
    document.documentElement.style.overflow = originalOverflow;
    document.documentElement.style.scrollbarGutter = originalScrollbarGutter;
  });

  it("shows the photo as a modal with frame-targeted controls", async (t) => {
    let result = render(
      <div>
        <main id={jam2026ModalConfig.pageBackgroundId}>Page content</main>
        <Jam2026PhotoViewerFrame animateEntrance={false} viewer={viewerAt(1)} />
      </div>,
    );
    t.after(result.cleanup);
    await nextFrame(result);

    let dialog =
      result.container.querySelector<HTMLElement>("[role='dialog']")!;
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.querySelector("#photo-viewer-title")?.textContent).toBe(
      "DSC02.jpg",
    );
    expect(dialog.textContent).toContain("2 / 3");
    expect(dialog.querySelector("img")?.getAttribute("src")).toContain(
      "DSC02.jpg",
    );

    // Modal effects: focus moves in, the page behind is locked and inert.
    expect(document.activeElement).toBe(getLink(dialog, "Close photo"));
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(
      result.container
        .querySelector(`#${jam2026ModalConfig.pageBackgroundId}`)
        ?.hasAttribute("inert"),
    ).toBe(true);

    for (let [label, photo] of [
      ["Previous photo", "DSC01"],
      ["Next photo", "DSC03"],
    ]) {
      let link = getLink(dialog, label);
      expect(link.getAttribute("href")).toBe(
        routes.jam.y2026.photos.show.href({ photo }),
      );
      expect(link.getAttribute("data-rmx-target")).toBe(
        jam2026ModalConfig.frameName,
      );
      expect(link.getAttribute("data-rmx-history")).toBe("replace");
    }

    // The filmstrip: neighbors in order, the open photo marked current.
    let timeline = [
      ...dialog.querySelectorAll<HTMLAnchorElement>(
        "ol[aria-label='Nearby photos'] a",
      ),
    ];
    expect(timeline.map((link) => link.getAttribute("href"))).toEqual(
      ["DSC01", "DSC02", "DSC03"].map((photo) =>
        routes.jam.y2026.photos.show.href({ photo }),
      ),
    );
    expect(timeline.map((link) => link.getAttribute("aria-current"))).toEqual([
      null,
      "true",
      null,
    ]);
    expect(timeline[0].getAttribute("data-rmx-target")).toBe(
      jam2026ModalConfig.frameName,
    );

    let download = getLink(dialog, "Download DSC02.jpg");
    expect(download.getAttribute("href")).toBe(
      routes.jam.y2026.photos.download.href({ photo: "DSC02" }),
    );
    expect(download.hasAttribute("download")).toBe(true);

    let close = getLink(dialog, "Close photo");
    expect(close.getAttribute("href")).toBe(routes.jam.y2026.index.href());
    expect(close.getAttribute("data-rmx-target")).toBe(
      jam2026ModalConfig.frameName,
    );
  });

  it("doesn't replay its entrance when a step arrives with entrance motion on", async (t) => {
    // A server-rendered viewer has no entrance; the frame responses fetched
    // for each step ask for one.
    let result = render(
      <Jam2026PhotoViewerFrame animateEntrance={false} viewer={viewerAt(0)} />,
    );
    t.after(result.cleanup);
    await nextFrame(result);

    await result.act(() =>
      result.root.render(
        <Jam2026PhotoViewerFrame animateEntrance viewer={viewerAt(1)} />,
      ),
    );
    await nextFrame(result);

    let dialog =
      result.container.querySelector<HTMLElement>("[role='dialog']")!;
    expect(dialog.querySelector("#photo-viewer-title")?.textContent).toBe(
      "DSC02.jpg",
    );
    // The scrim, the photo's window, and the row of cards each have an
    // entrance; none of them should play.
    for (let element of [
      dialog.parentElement!,
      dialog.querySelector("section")!,
      dialog.querySelector("ol")!,
    ]) {
      expect(element.getAnimations()).toHaveLength(0);
    }
  });

  it("grows out of the card that opened it, or rolls down without one", async (t) => {
    let renderPage = (viewer?: PhotoViewerState) => (
      <div>
        <main id={jam2026ModalConfig.pageBackgroundId}>
          <div style={{ width: "150px", transform: "rotate(2deg)" }}>
            <a href={routes.jam.y2026.photos.show.href({ photo: "DSC02" })}>
              View
            </a>
            <div style={{ width: "150px", height: "100px" }} />
          </div>
        </main>
        <Jam2026PhotoViewerFrame animateEntrance viewer={viewer} />
      </div>
    );
    let result = render(renderPage());
    t.after(result.cleanup);

    await result.act(() => result.root.render(renderPage(viewerAt(1))));
    let card = result.container.querySelector("main > div") as HTMLElement;
    let [expand] = result.container
      .querySelector("[role='dialog'] section")!
      .getAnimations() as Animation[];
    let [from] = (expand.effect as KeyframeEffect).getKeyframes();
    expect(String(from.transform)).toMatch(/rotate\(2deg\) scale\([\d.]+\)/);
    // The card lifts out while its photo grows, then returns.
    expect(card.style.visibility).toBe("hidden");
    expand.finish();
    await result.act(() => expand.finished);
    expect(card.style.visibility).toBe("");

    // A photo with no card on the page rolls down instead.
    await result.act(() => result.root.render(renderPage()));
    await result.act(() => result.root.render(renderPage(viewerAt(2))));
    let [rollDown] = result.container
      .querySelector("[role='dialog'] section")!
      .getAnimations() as Animation[];
    expect(
      String((rollDown.effect as KeyframeEffect).getKeyframes()[0].clipPath),
    ).toContain("inset(0px 0px 100%");
  });

  it("steps to the neighboring photos with the arrow keys", async (t) => {
    let navigations = mockNavigation(t);
    let result = render(
      <Jam2026PhotoViewerFrame animateEntrance={false} viewer={viewerAt(0)} />,
    );
    t.after(result.cleanup);
    await nextFrame(result);

    pressKey("ArrowRight");
    pressKey("ArrowLeft");

    expect(navigations).toEqual([
      routes.jam.y2026.photos.show.href({ photo: "DSC02" }),
      routes.jam.y2026.photos.show.href({ photo: "DSC03" }),
    ]);
  });

  it("closes with Escape by shrinking into the viewed photo's card", async (t) => {
    let navigations = mockNavigation(t);
    // Gallery cards: a tilted card holding its link and its image.
    let renderPage = (viewer?: PhotoViewerState) => (
      <div>
        <main id={jam2026ModalConfig.pageBackgroundId}>
          {photos.map((photo) => (
            <div
              key={photo.slug}
              data-card={photo.slug}
              style={{ width: "150px", transform: "rotate(-3deg)" }}
            >
              <a
                href={routes.jam.y2026.photos.show.href({ photo: photo.slug })}
              >
                {photo.filename}
              </a>
              <div style={{ width: "150px", height: "100px" }} />
            </div>
          ))}
        </main>
        <Jam2026PhotoViewerFrame animateEntrance={false} viewer={viewer} />
      </div>
    );
    let result = render(renderPage(viewerAt(2)));
    t.after(result.cleanup);
    await nextFrame(result);

    await result.act(() => pressKey("Escape"));
    await nextFrame(result);

    let section = result.container.querySelector<HTMLElement>(
      "[role='dialog'] section",
    )!;
    let card = result.container.querySelector<HTMLElement>(
      "[data-card='DSC03']",
    )!;
    // The closing animation releases the page and shrinks the window into
    // the card, which hides until the window is gone.
    expect(section.getAttribute("data-state")).toBe("closing");
    expect(section.getAttribute("data-exit")).toBe("shrink");
    let [shrink] = section.getAnimations() as Animation[];
    let to = (shrink.effect as KeyframeEffect).getKeyframes().at(-1)!;
    expect(String(to.transform)).toMatch(/rotate\(-3deg\) scale\([\d.]+\)/);
    expect(card.style.visibility).toBe("hidden");
    expect(navigations).toEqual([]);

    shrink.finish();
    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(navigations).toEqual([routes.jam.y2026.index.href()]);

    await result.act(() => result.root.render(renderPage(undefined)));
    await nextFrame(result);

    expect(result.container.querySelector("[role='dialog']")).toBe(null);
    expect(card.style.visibility).toBe("");
    expect(document.activeElement?.textContent).toBe("DSC03.jpg");
  });
});

function getLink(container: HTMLElement, label: string) {
  let link = container.querySelector<HTMLAnchorElement>(
    `a[aria-label="${label}"]:not([tabindex="-1"])`,
  );
  if (!link) throw new Error(`Unable to find link: ${label}`);
  return link;
}

function pressKey(key: string) {
  document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));
}

async function nextFrame(result: ReturnType<typeof render>) {
  await result.act(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
}

/** Records frame navigations instead of performing them. */
function mockNavigation(t: TestContext) {
  let navigations: string[] = [];
  let navigation = window.navigation;
  let originalNavigate = navigation.navigate;
  navigation.navigate = ((url: string) => {
    navigations.push(new URL(url, window.location.href).pathname);
    return {
      committed: Promise.resolve(navigation.currentEntry),
      finished: Promise.resolve(navigation.currentEntry),
    } as ReturnType<typeof navigation.navigate>;
  }) as typeof navigation.navigate;
  t.after(() => {
    navigation.navigate = originalNavigate;
  });
  return navigations;
}
