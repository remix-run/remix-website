import type { LoaderFunction } from "@remix-run/node";
import { getBlogPostListings } from "~/lib/blog.server";

const getCData = (text: string) => {
  return `<![CDATA[${text}]]>`;
};

export const loader: LoaderFunction = async () => {
  const blogUrl = `https://remix.run/blog`;
  const posts = await getBlogPostListings();

  const rss = `
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Remix Blog</title>
        <link>${blogUrl}</link>
        <atom:link href="${blogUrl}/rss.xml" rel="self" type="application/rss+xml" />
        <description>Thoughts about building excellent user experiences with Remix.</description>
        <language>en-us</language>
        <generator>https://github.com/remix-run/remix</generator>
        <copyright>© Shopify, Inc.</copyright>
        ${posts
          .map(post =>
            `
            <item>
              <title>${getCData(post.title)}</title>
              <description>${getCData(post.summary)}</description>
              <pubDate>${new Date(post.dateDisplay).toUTCString()}</pubDate>
              <link>${blogUrl}/${post.slug}</link>
              <guid>${blogUrl}/${post.slug}</guid>
            </item>
          `.trim(),
          )
          .join('\n')}
      </channel>
    </rss>
  `.trim();


  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0",
    },
  });
};