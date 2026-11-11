import { expect } from "remix/assert";
import {
  afterEach,
  beforeEach,
  describe,
  it,
  type TestContext,
} from "remix/test";
import { on } from "remix/component";
import { render } from "remix/component/test";

import { Jam2026PhotoViewerFrame } from "./photo-viewer.tsx";
import { jam2026ModalConfig } from "./modal-contract.ts";
import {
  setGalleryCards,
  type PhotoViewerState,
  type PhotoCard,
} from "./shopify-photo.ts";
import { routes } from "../../../../routes.ts";

let photos: PhotoCard[] = ["DSC01", "DSC02", "DSC03"].map((slug) => ({
  url: `https://cdn.shopify.com/files/${slug}.jpg`,
  filename: `${slug}.jpg`,
  slug,
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
          <div style={{ width: "150px" }}>
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
    expect(String(from.transform)).toMatch(/^translate\(.+\) scale\([\d.]+\)$/);
    // The card's photo lifts out while it grows, and the card's frame fades
    // out rather than scaling along; both come back after.
    let cardImage = card.lastElementChild as HTMLElement;
    expect(cardImage.style.visibility).toBe("hidden");
    expect(card.getAnimations()).toHaveLength(1);
    expand.finish();
    await result.act(() => expand.finished);
    expect(cardImage.style.visibility).toBe("");
    expect(card.getAnimations()).toHaveLength(0);

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

  it("closing mid-open shrinks from wherever the window got to", async (t) => {
    mockNavigation(t);
    let renderPage = (viewer?: PhotoViewerState) => (
      <div>
        <main id={jam2026ModalConfig.pageBackgroundId}>
          <div style={{ width: "150px" }}>
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
    let section = result.container.querySelector<HTMLElement>(
      "[role='dialog'] section",
    )!;
    let [expand] = section.getAnimations() as Animation[];
    expand.pause();
    expand.currentTime = 100;
    let midway = getComputedStyle(section).transform;

    await result.act(() => pressKey("Escape"));
    await nextFrame(result);

    expect(expand.playState).toBe("idle");
    let shrink = (section.getAnimations() as Animation[]).find(
      (animation) =>
        (animation.effect as KeyframeEffect).getKeyframes()[0].transform,
    )!;
    let [from, to] = (shrink.effect as KeyframeEffect).getKeyframes();
    expect(from.transform).toBe(midway);
    expect(String(to.transform)).toMatch(/^translate\(.+\) scale\([\d.]+\)$/);
    // The cancelled open doesn't bring the card's photo back mid-close.
    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    let card = result.container.querySelector("main > div")!;
    expect((card.lastElementChild as HTMLElement).style.visibility).toBe(
      "hidden",
    );
  });

  it("keeps focus inside the dialog", async (t) => {
    let result = render(
      <div>
        <button type="button">Outside</button>
        <Jam2026PhotoViewerFrame animateEntrance={false} viewer={viewerAt(1)} />
      </div>,
    );
    t.after(result.cleanup);
    await nextFrame(result);
    let dialog =
      result.container.querySelector<HTMLElement>("[role='dialog']")!;

    await result.act(() =>
      result.container.querySelector<HTMLButtonElement>("button")!.focus(),
    );

    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("shows the next photo as soon as an arrow key is pressed", async (t) => {
    let navigations = mockNavigation(t);
    setGalleryCards(photos);
    t.after(() => setGalleryCards([]));
    let result = render(
      <Jam2026PhotoViewerFrame animateEntrance={false} viewer={viewerAt(0)} />,
    );
    t.after(result.cleanup);
    await nextFrame(result);

    await result.act(() => pressKey("ArrowRight"));
    await result.act(() => pressKey("ArrowRight"));

    // Focus follows to the matching arrow in the title bar.
    expect(document.activeElement?.getAttribute("aria-label")).toBe(
      "Next photo",
    );
    // Ahead of the server: its props still say the first photo.
    let dialog =
      result.container.querySelector<HTMLElement>("[role='dialog']")!;
    expect(dialog.querySelector("#photo-viewer-title")?.textContent).toBe(
      "DSC03.jpg",
    );
    expect(dialog.textContent).toContain("3 / 3");
    expect(navigations).toEqual([
      routes.jam.y2026.photos.show.href({ photo: "DSC02" }),
      routes.jam.y2026.photos.show.href({ photo: "DSC03" }),
    ]);
  });

  it("steps one photo per click on the next arrow", async (t) => {
    let navigations = mockNavigation(t);
    setGalleryCards(photos);
    t.after(() => setGalleryCards([]));
    let result = render(
      <Jam2026PhotoViewerFrame animateEntrance={false} viewer={viewerAt(0)} />,
    );
    t.after(result.cleanup);
    await nextFrame(result);
    let dialog =
      result.container.querySelector<HTMLElement>("[role='dialog']")!;

    // Each click re-points the arrow before the next one.
    await result.act(() => getLink(dialog, "Next photo").click());
    await result.act(() => getLink(dialog, "Next photo").click());

    expect(dialog.querySelector("#photo-viewer-title")?.textContent).toBe(
      "DSC03.jpg",
    );
    expect(navigations).toEqual([
      routes.jam.y2026.photos.show.href({ photo: "DSC02" }),
      routes.jam.y2026.photos.show.href({ photo: "DSC03" }),
    ]);
  });

  it("opens the photos the filmstrip scrolls past, fetching where it stops", async (t) => {
    let navigations = mockNavigation(t);
    setGalleryCards(photos);
    t.after(() => setGalleryCards([]));
    let result = render(
      <Jam2026PhotoViewerFrame animateEntrance={false} viewer={viewerAt(0)} />,
    );
    t.after(result.cleanup);
    await nextFrame(result);
    await nextFrame(result);
    let row = result.container.querySelector<HTMLElement>(
      "[aria-label='Nearby photos']",
    )!;
    // Every photo in the gallery, with the open one in the middle.
    expect(row.children).toHaveLength(photos.length);
    let centerOf = (slug: string) => {
      let item = row.querySelector<HTMLElement>(`[data-slug='${slug}']`)!;
      return item.offsetLeft + item.offsetWidth / 2 - row.clientWidth / 2;
    };
    expect(Math.abs(row.scrollLeft - centerOf("DSC01"))).toBeLessThan(1);
    // Let the row's own scroll to the open photo finish.
    await new Promise((resolve) => setTimeout(resolve, 300));

    // The reader scrolls to the third photo: it opens on the way, and is
    // fetched once the row stops.
    row.scrollLeft = centerOf("DSC03");
    await waitFor(() => navigations.length > 0);

    expect(
      result.container.querySelector("#photo-viewer-title")?.textContent,
    ).toBe("DSC03.jpg");
    expect(navigations).toEqual([
      routes.jam.y2026.photos.show.href({ photo: "DSC03" }),
    ]);
  });

  it("opens as soon as a photo link is clicked", async (t) => {
    setGalleryCards(photos);
    t.after(() => setGalleryCards([]));
    let result = render(
      <div>
        <a
          data-rmx-target={jam2026ModalConfig.frameName}
          href={routes.jam.y2026.photos.show.href({ photo: "DSC02" })}
          // The frame runtime isn't running here; keep the page in place.
          mix={on("click", (event) => event.preventDefault())}
        >
          Card
        </a>
        <Jam2026PhotoViewerFrame animateEntrance={false} />
      </div>,
    );
    t.after(result.cleanup);
    await result.act(() => {});
    expect(result.container.querySelector("[role='dialog']")).toBe(null);

    await result.act(() => result.container.querySelector("a")!.click());

    expect(
      result.container.querySelector("#photo-viewer-title")?.textContent,
    ).toBe("DSC02.jpg");
  });

  it("shows a loading bar until the full-size image loads", async (t) => {
    let result = render(
      <Jam2026PhotoViewerFrame animateEntrance={false} viewer={viewerAt(0)} />,
    );
    t.after(result.cleanup);
    await result.act(() => {});
    let img = result.container.querySelector<HTMLImageElement>(
      "[role='dialog'] section img",
    )!;
    expect(img.parentElement!.hasAttribute("data-loading")).toBe(true);

    await result.act(() => img.dispatchEvent(new Event("load")));

    expect(img.parentElement!.hasAttribute("data-loading")).toBe(false);
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
    // Gallery cards: a card holding its link and its image.
    let renderPage = (viewer?: PhotoViewerState) => (
      <div>
        <main id={jam2026ModalConfig.pageBackgroundId}>
          {photos.map((photo) => (
            <div
              key={photo.slug}
              data-card={photo.slug}
              style={{ width: "150px" }}
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
    // The closing animation releases the page and shrinks the photo into
    // the card's, which hides until the window is gone. The card's frame
    // fades in meanwhile, rather than the window's scaling down to it.
    expect(section.getAttribute("data-state")).toBe("closing");
    expect(section.getAttribute("data-exit")).toBe("shrink");
    let [shrink] = section.getAnimations() as Animation[];
    let to = (shrink.effect as KeyframeEffect).getKeyframes().at(-1)!;
    expect(String(to.transform)).toMatch(/^translate\(.+\) scale\([\d.]+\)$/);
    let cardImage = card.lastElementChild as HTMLElement;
    expect(cardImage.style.visibility).toBe("hidden");
    expect(card.getAnimations()).toHaveLength(1);
    expect(navigations).toEqual([]);

    shrink.finish();
    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(navigations).toEqual([routes.jam.y2026.index.href()]);

    await result.act(() => result.root.render(renderPage(undefined)));
    await nextFrame(result);

    expect(result.container.querySelector("[role='dialog']")).toBe(null);
    expect(cardImage.style.visibility).toBe("");
    expect(card.getAnimations()).toHaveLength(0);
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

// Polls until the check passes or the time runs out.
async function waitFor(check: () => boolean, timeout = 2000) {
  let deadline = Date.now() + timeout;
  while (!check() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
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
