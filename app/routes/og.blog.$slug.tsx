import invariant from "tiny-invariant";
import getEmojiRegex from "emoji-regex";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  isOpenGraphImageRequest,
  type OpenGraphImageData,
} from "remix-og-image";
import {
  type BlogAuthor,
  getBlogPost,
  getBlogPostListings,
} from "~/lib/blog.server";
import { Wordmark } from "~/ui/logo";

interface AuthorWithImage extends BlogAuthor {
  imgSrc: string;
}

export async function openGraphImage() {
  const posts = await getBlogPostListings();

  return posts.map<OpenGraphImageData>((post) => {
    return {
      name: post.slug,
      params: { slug: post.slug },
    };
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (isOpenGraphImageRequest(request)) {
    return openGraphImage();
  }

  let { slug } = params;
  invariant(!!slug, "Expected slug param");

  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;
  let post = await getBlogPost(slug);

  let backgroundImage: string | undefined;

  if (post.ogImage) {
    backgroundImage = `url(${siteUrl}${post.ogImage})`;
  } else {
    let socialBackground = await import(
      "./img.$slug/social-background.png?arraybuffer"
    );
    let base64 = arrayBufferToBase64(socialBackground.default);
    backgroundImage = `url("data:image/png;base64,${base64}")`;
  }

  return {
    post: {
      ...post,
      dateDisplay: stripEmojis(post.dateDisplay),
      authors: post.authors.map((author) => {
        return {
          ...author,
          title: stripEmojis(author.title),
          imgSrc: getAuthorImgSrc(siteUrl, author.name),
        };
      }),
    },
    backgroundImage,
  };
}

export default function OpenGraphImageTemplate() {
  const { post, backgroundImage } = useLoaderData<typeof loader>();

  return (
    <div
      id="og-image"
      className="flex h-[628px] w-[1200px] items-end justify-center border border-gray-800 bg-no-repeat"
      style={{ backgroundImage, backgroundSize: "100% 100%" }}
    >
      <div className="flex h-full w-full flex-col justify-between p-16 text-2xl text-white">
        <div className="flex flex-col">
          <div className="text-gray-200">{post.dateDisplay}</div>
          <h1 className="mt-6 text-pretty pr-40 text-7xl font-black leading-[1.1]">
            {post.title}
          </h1>
        </div>

        <Authors authors={post.authors} />
      </div>
    </div>
  );
}

// Taken from https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function getAuthorImgSrc(siteUrl: string, name: string) {
  let authorNameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");

  return `${siteUrl}/authors/profile-${authorNameSlug}.png`;
}

function stripEmojis(string: string): string {
  return string.replace(getEmojiRegex(), "").replace(/\s+/g, " ").trim();
}

function Authors({ authors }: { authors: AuthorWithImage[] }) {
  // We will have problems if we have more than 2 authors
  let picDimensions = authors.length * -40 + 280;

  return (
    <div className="flex items-end justify-between">
      <div className="flex flex-col gap-6">
        {authors.map((author) => (
          <div
            key={author.name + author.title}
            className="flex items-center gap-6"
          >
            <img
              width={picDimensions}
              height={picDimensions}
              alt=""
              src={author.imgSrc}
              className="ml-0 size-28 rounded-full"
            />
            <div className="flex flex-col">
              <p
                className="font-black"
                style={{ fontSize: authors.length * -6 + 44 }}
              >
                {author.name}
              </p>
              <p className="text-xl text-gray-200">{author.title}</p>
            </div>
          </div>
        ))}
      </div>
      <Wordmark className="mb-8 h-[60px] w-[240px] opacity-25" />
    </div>
  );
}
