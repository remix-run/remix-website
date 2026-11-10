export type Photo = {
  url: string;
  altText?: string;
  width: number;
  height: number;
};

export function getPhotoFilename(photo: Photo, index: number) {
  try {
    let name = new URL(photo.url).pathname.split("/").at(-1);
    if (name) return decodeURIComponent(name);
  } catch {
    /* fall through to the numbered name */
  }
  return `PHOTO-${index + 1}.JPG`;
}

export function resizeShopifyImage(url: string, width: number) {
  try {
    let resized = new URL(url);
    resized.searchParams.set("width", String(width));
    resized.searchParams.set("format", "webp");
    resized.searchParams.set("quality", "85");
    return resized.toString();
  } catch {
    return url;
  }
}
