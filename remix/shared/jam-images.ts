export function transformShopifyImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    format?: "webp" | "jpg" | "png";
    quality?: number;
  } = {},
) {
  try {
    let urlObj = new URL(url);
    let params = new URLSearchParams(urlObj.search);
    for (let [key, value] of Object.entries(options)) {
      if (value !== undefined) params.set(key, value.toString());
    }
    urlObj.search = params.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
}
