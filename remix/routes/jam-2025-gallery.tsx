import { getPhotos } from "./jam-storefront.server";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control";
import {
  JamDocument,
  ScrambleText,
  Title,
  transformShopifyImageUrl,
} from "./jam-shared";
import ogImageSrc from "../../app/routes/jam/images/og-gallery.jpg";

type Photo = Awaited<ReturnType<typeof getPhotos>>[number];

export async function jam2025GalleryHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/jam/2025/gallery`;
  let previewImage = `${requestUrl.origin}${ogImageSrc}`;
  let photos = await Promise.all([
    getPhotos("remix-jam-2025-photos-1"),
    getPhotos("remix-jam-2025-photos-2"),
  ]).then((p) => p.flat());

  return render.document(
    <JamDocument
      title="Photo Gallery | Remix Jam 2025"
      description="Photos from Remix Jam 2025"
      pageUrl={pageUrl}
      previewImage={previewImage}
      activePath="/jam/2025/gallery"
      hideBackground
    >
      <main class="mx-auto flex max-w-[1920px] flex-col items-center gap-12 py-20 pt-[120px] text-center md:pt-[200px] lg:pt-[210px]">
        <Title>
          <ScrambleText text="Photo" />
          <ScrambleText text="Gallery" />
        </Title>

        {photos.length === 0 ? (
          <p class="text-lg text-white/70">No photos available yet.</p>
        ) : (
          <>
            {/* TODO(remix-jam-interactions): Restore modal, query-param navigation, keyboard controls, and download action. */}
            <div class="w-full columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 2xl:columns-4">
              {photos.map((photo) => (
                <div
                  key={photo.url}
                  class="mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg bg-white/5 md:mb-6"
                >
                  <PhotoImage {...photo} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </JamDocument>,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}

function PhotoImage() {
  return ({ url, altText, width, height }: Photo) => {
    let sizes = [400, 600, 800, 1200];
    let srcSet = sizes
      .map((size) => {
        let sizedUrl = transformShopifyImageUrl(url, {
          width: size,
          format: "webp",
          quality: 85,
        });
        return `${sizedUrl} ${size}w`;
      })
      .join(", ");

    let src = transformShopifyImageUrl(url, {
      width: 800,
      format: "webp",
      quality: 85,
    });

    return (
      <img
        src={src}
        srcSet={srcSet}
        alt={altText || ""}
        width={width}
        height={height}
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1535px) 33vw, 25vw"
        loading="lazy"
        class="w-full select-none transition-transform duration-300 hover:scale-105"
      />
    );
  };
}
