import { renderToStream } from "remix/component/server";
import { describe, expect, it } from "vitest";
import { JamGalleryNavigation } from "./jam-gallery-navigation";

let photos = [
  {
    url: "https://example.com/photo-1.jpg",
    altText: "Photo 1",
    width: 1200,
    height: 800,
  },
  {
    url: "https://example.com/photo-2.jpg",
    altText: "Photo 2",
    width: 800,
    height: 1200,
  },
];

async function renderHtml(node: unknown) {
  return await new Response(renderToStream(node as any)).text();
}

describe("JamGalleryNavigation", () => {
  it("renders the modal for direct visits with a selected photo", async () => {
    let html = await renderHtml(
      <JamGalleryNavigation photos={photos} initialSelectedPhotoIndex={1} />,
    );

    expect(html).toContain("data-gallery-modal");
    expect(html).toContain('data-gallery-modal-primary-focus=""');
    expect(html).toContain('aria-label="Previous photo"');
    expect(html).toContain('aria-label="Close modal"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain("/ 2");
  });

  it("renders only the controller marker when closed", async () => {
    let html = await renderHtml(
      <JamGalleryNavigation photos={photos} initialSelectedPhotoIndex={null} />,
    );

    expect(html).toContain("data-jam-gallery-navigation");
    expect(html).not.toContain("data-gallery-modal");
  });
});
