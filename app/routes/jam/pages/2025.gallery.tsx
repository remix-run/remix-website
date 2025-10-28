import { getMeta } from "~/lib/meta";
import { Title, ScrambleText } from "../text";
import { getPhotos, transformShopifyImageUrl } from "../storefront.server";
import ogImageSrc from "../images/og-thumbnail-1.jpg";
import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";

export const handle = {
  hideBackground: true,
  showSeats: false,
};

export const meta: MetaFunction = ({ matches }) => {
  const [rootMatch] = matches;
  const { siteUrl } = rootMatch.data as { siteUrl: string };

  let image = `${siteUrl}${ogImageSrc}`;

  return getMeta({
    title: "Photo Gallery | Remix Jam 2025",
    description: "Photos from Remix Jam 2025 in Toronto",
    siteUrl: `${siteUrl}/jam/2025/gallery`,
    image,
  });
};

export async function loader() {
  const photos = await Promise.all([
    getPhotos("remix-jam-2025-photos-1"),
    getPhotos("remix-jam-2025-photos-2"),
  ]).then((p) => p.flat());

  const optimizedPhotos = photos.map((photo) => {
    // Generate responsive image URLs using Shopify CDN
    const sizes = [400, 600, 800, 1200];
    const srcSet = sizes
      .map((size) => {
        const url = transformShopifyImageUrl(photo.url, {
          width: size,
          format: "webp",
          quality: 85,
        });
        return `${url} ${size}w`;
      })
      .join(", ");

    const src = transformShopifyImageUrl(photo.url, {
      width: 800,
      format: "webp",
      quality: 85,
    });

    return {
      ...photo,
      src,
      srcSet,
    };
  });

  return { photos: optimizedPhotos };
}

export default function GalleryPage() {
  const { photos } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto flex max-w-[1920px] flex-col items-center gap-12 py-20 pt-[120px] text-center md:pt-[200px] lg:pt-[210px]">
      <Title>
        <ScrambleText
          text="Photo"
          delay={100}
          charDelay={70}
          cyclesToResolve={8}
          color="blue"
        />
        <ScrambleText text="Gallery" delay={300} color="green" />
      </Title>

      {photos.length === 0 ? (
        <p className="text-lg text-white/70">No photos available yet.</p>
      ) : (
        <div className="w-full columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 2xl:columns-4">
          {photos.map((photo, index: number) => (
            <div
              key={index}
              className="mb-4 break-inside-avoid overflow-hidden rounded-lg bg-white/5 md:mb-6"
            >
              <img
                src={photo.src}
                srcSet={photo.srcSet}
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1535px) 33vw, 25vw"
                alt={photo.altText || ""}
                loading="lazy"
                width={photo.width}
                height={photo.height}
                className="w-full transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
