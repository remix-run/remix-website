import { getSeo } from "~/modules/remix-seo";

export const seo = getSeo({
  host: "https://remix.run",
  titleTemplate: "Remix | %s",
  defaultTitle: "Remix",
  twitter: {
    site: "@remix_run",
    creator: "@remix_run",
    title: "Remix",
    card: "summary",
    // image: {
    //   url: "/twitterimage.jpg",
    //   alt: "Remix logo",
    // },
  },
  openGraph: {
    // images: [
    //   {
    //     url: "/ogimage.png",
    //     alt: "Remix logo",
    //     height: 627,
    //     width: 1200,
    //   },
    // ],
    // defaultImageHeight: 250,
    // defaultImageWidth: 500,
  },
});
