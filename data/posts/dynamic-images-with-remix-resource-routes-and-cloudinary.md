---
title: Dynamic Images with Remix Resource Routes and Cloudinary
summary: Ever wonder how to automate the social-media-sharing images on your blog? Remix resource routes and Cloudinary have you covered.
date: 2022-07-28
featured: true
image: /blog-images/headers/colorful-clouds.jpg
imageAlt: "Vivid pink fluffy clouds in a pastel blue sky, with silhouettes of birds flying in the foreground"
authors:
  - Chance Strickland
---

One of my favorite features in Remix is the [resource route](https://remix.run/docs/en/v1/guides/resource-routes#creating-resource-routes). Some folks refer to them as "API routes", but in truth that name doesn't give you a full picture of what you can do with them.

A resource route can be used to serve _any_ resource that can sent in a response—not just an HTML page or JSON data. Just like any other route, the resource can be static or determined dynamically based on the request's URL parameters.

In this tutorial, I'll show you how I used a resource route on remix.run to dynamically generate the preview cards you'll see when you share one of our blog posts on social media.

![Social media preview image with all of the details for this blog post][final-image]

I also used the wonderful [transformations API by Cloudinary](https://cloudinary.com/documentation/transformation_reference), which made this task both fun and way simpler than it had any right to be!

## Creating an image template

We'll need some sort of shared image template on which we will embed our blog post metadata. We'll use the same one we designed for the Remix blog.

![A simple black space with a colorful gradient border and the Remix logo watermark in the corner][image-template]

A good template should allow for plenty of blank space to allow for embedded text and images to show up clearly. When choosing a background color, consider what color you'd like for the text elements and make sure to ensure your [color contrast levels][contrast-checker] are appropriate for readability!

Go ahead and [create a Cloudinary account][cloudinary-signup] if you don't have one. Once you have your account ready and template designed, upload the image to your Cloudinary media library, preferably inside a folder where you'll include all related files for this project.

## Setting up the route

To get started, we'll need a route that will return our image. For the Remix site, I went with `/img/social`, as we'll specifically be looking for an image we expect to use for social media preview cards. We can serve other images from our site, so the nested structure makes sense in our case.

In `app/routes`, we'll create a new file: `img/social.ts`. Since we'll be using this route to handle `GET` requests, we can go ahead and export a `loader` function.

```ts
// app/routes/img/social.ts
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  throw Error("Loader not implemented!");
}
```

The first thing I like to do here is write out what steps we'll need to take to make this work. This generally starts with a few short comments:

```ts
// app/routes/img/social.ts
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  // 1. Get blog post data from the URL
  // 2. Validate the data
  // 3. Construct a URL for a Cloudinary transformation image
  // 4. Fetch the image from Cloudinary
  // 5. Return a response

  throw Error("Loader not implemented!");
}
```

## Building the Cloudinary request from search parameters

We're aiming to generate preview images for our blog with a few details about the post we're sharing. For us, that includes:

- Title of the post
- The author's name
- The author's job title
- The post's published date

We will expect that data to be provided in the URL's search string, which we can get from the request.

```ts
// app/routes/img/social.ts
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  // 1. Get blog post data from the URL
  let requestUrl = new URL(request.url);
  let searchParams = new URLSearchParams(requestUrl.search);

  let title = searchParams.get("title");
  let authorName = searchParams.get("authorName");
  let authorTitle = searchParams.get("authorTitle");
  let date = searchParams.get("date");

  // 2. Validate the data
  if (!title || !authorName || !authorTitle || !date) {
    throw json({ error: "Missing required params" }, 400);
  }

  // 3. Construct a URL for a Cloudinary transformation image
  // 4. Fetch the image from Cloudinary
  // 5. Return a response

  throw Error("Loader not implemented!");
}
```

Next I'll need to translate our data into a URL based the Cloudinary API. I'll pull this out into a separate function to keep our loader from getting too messy.

```ts
// app/routes/img/social.ts
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  // 1. Get blog post data from the URL
  let requestUrl = new URL(request.url);
  let searchParams = new URLSearchParams(requestUrl.search);

  let title = searchParams.get("title");
  let authorName = searchParams.get("authorName");
  let authorTitle = searchParams.get("authorTitle");
  let date = searchParams.get("date");

  // 2. Validate the data
  if (!title || !authorName || !authorTitle || !date) {
    throw json({ error: "Missing required params" }, 400);
  }

  // 3. Construct a URL for a Cloudinary transformation image
  let socialImageUrl = getCloudinarySocialImageUrl({
    title,
    authorName,
    authorTitle,
    date,
  });

  // 4. Fetch the image from Cloudinary
  // 5. Return a response

  throw Error("Loader not implemented!");
}
```

**A quick note:** the Cloudinary URL can be tough to parse, so I'll add some comments to explain what we're constructing here. If you want to understand it a bit more deeply, I recommend reading Cloudinary's [transformations API documentation](https://cloudinary.com/documentation/transformation_reference) to learn how you can adapt this function for your own needs.

```ts
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_FOLDER_NAME = process.env.CLOUDINARY_FOLDER_NAME;

function getCloudinarySocialImageUrl({
  title,
  date,
  authorName,
  authorTitle,
}: SocialImageArgs) {
  // We'll use two colors for the text in our images.
  // Important: No leading hash for hex values!
  let primaryTextColor = "ffffff";
  let secondaryTextColor = "d0d0d0";

  // Custom font files — these must be uploaded to cloudinary in
  // the same cloud and folder as our source images
  let primaryFont = "Inter-Medium.woff2";
  let titleFont = "Founders-Grotesk-Bold.woff2";

  // The data needed for our URL is passed as comma-separated
  // strings joined into path segments. I'll break these parts into
  // a few arrays that we'll join at the end to make it easier to
  // see what all of these strings are doing.

  // The first URL segment will define a few variables that we can
  // use in other parts of our URL.
  let vars = [
    "$th_1256", // image height in pixels ($th = 1256)
    "$tw_2400", // image width in pixels ($tw = 2400)
    "$gh_$th_div_12", // image height / 12 ($gh = $th / 12)
    "$gw_$tw_div_24", // image width / 24 ($gw = $tw / 24)
  ].join(",");

  // We start with an image template we created as a blank base.
  // This image is uploaded to our Cloudinary account in a folder
  // alongside custom fonts and other assets we'll use on our site.
  // We store our CLOUDINARY_FOLDER_NAME as an environment variable.
  let templateImage = `${CLOUDINARY_FOLDER_NAME}/social-background.png`;

  // We'll need a path segment to define a few baseline
  // transformations.
  let templateImageTransform = [
    "c_fill", // how our image fits into the boundaries (fill)
    "w_$tw", // image width
    "h_$th", // image height
  ].join(",");

  // Now we get to provide some data for our image!
  //
  // Because our data may contain characters that collide with
  // Cloudinary's API, we should escape that data twice to avoid
  // errors.
  //
  // See https://support.cloudinary.com/hc/en-us/articles/202521512-How-to-add-a-slash-character-or-any-other-special-characters-in-text-overlays-

  // Let's start with our blog post's publish date:
  let encodedDate = doubleEncode(stripEmojis(date));
  // Now we need to define the transformation (how the date
  // appears in our image)
  let dateTransform = [
    `co_rgb:${secondaryTextColor}`, // text color
    "c_fit", // fit rule
    "g_north_west", // text box position
    "w_$gw_mul_14", // text box width ($gw * 14)
    "h_$gh", // text box height
    "x_$gw_mul_1.5", // text box x position ($gw * 1.5)
    "y_$gh_mul_1.3", // text box y position ($gh * 1.3)
    `l_text:${CLOUDINARY_FOLDER_NAME}:${primaryFont}_50_bold:${encodedDate}`, // textbox:font:content
  ].join(",");

  // Now we'll just repeat these steps for our other data
  let encodedTitle = doubleEncode(stripEmojis(title));
  let titleTransform = [
    `co_rgb:${primaryTextColor}`, // text color
    "c_fit", // fit rule
    "g_north_west", // text box position
    "w_$gw_mul_18", // text box width ($gw * 18)
    "h_$gh_mul_7", // text box height ($gh * 7)
    "x_$gw_mul_1.5", // text box x position ($gw * 1.5)
    "y_$gh_mul_2.3", // text box y position ($gh * 2.3)
    `l_text:${CLOUDINARY_FOLDER_NAME}:${titleFont}_160:${encodedTitle}`, // textbox:font:content
  ].join(",");

  let encodedAuthorName = doubleEncode(stripEmojis(authorName));
  let authorNameSlug = slugify(stripEmojis(authorName));
  let authorNameTransform = [
    `co_rgb:${primaryTextColor}`, // text color
    `c_fit`, // fit rule
    `g_north_west`, // text box position
    `w_$gw_mul_8.5`, // text box width ($gw * 8.5)
    `h_$gh_mul_4`, // text box height ($gh * 4)
    `x_$gw_mul_4.5`, // text box x position ($gw * 4.5)
    `y_$gh_mul_9`, // text box y position ($gh * 9)
    `l_text:${CLOUDINARY_FOLDER_NAME}:${primaryFont}_70:${encodedAuthorName}`, // textbox:font:content
  ].join(",");

  let encodedAuthorTitle = doubleEncode(stripEmojis(authorTitle));
  let authorTitleTransform = [
    `co_rgb:${secondaryTextColor}`, // text color
    `c_fit`, // fit rule
    `g_north_west`, // text box position
    `w_$gw_mul_9`, // text box width ($gw * 9)
    `x_$gw_mul_4.5`, // text box x position ($gw * 4.5)
    `y_$gh_mul_9.8`, // text box y position ($gh * 9.8)
    `l_text:${CLOUDINARY_FOLDER_NAME}:${primaryFont}_40:${encodedAuthorTitle}`, // textbox:font:content
  ].join(",");

  // We also want to add our author's headshot to our image.
  // Cloudinary is awesome and allows you to do nested transforms,
  // so embedding other images with their own rules is a breeze.
  //
  // Each of our author's has an image uploaded following the same
  // conventions for simplicity — though you could also create a
  // resource route to handle this upload automatically if you want!
  let authorImageTransform = [
    "c_fit", // fit rule
    "g_north_west", // image position
    `r_max`, // image radius
    "w_$gw_mul_4", // image width ($gw * 4)
    "h_$gh_mul_3", // image height ($gh * 3)
    "x_$gw", // image x position ($gw)
    "y_$gh_mul_8", // image y position ($gh * 8)
    `l_${CLOUDINARY_FOLDER_NAME}:profile-${authorNameSlug}.jpg`, // image filename
  ].join(",");

  // Now we just join up all of the path segments and append them
  // to our cloud's transformation URL. CLOUDINARY_CLOUD_NAME is
  // also stored in an environment variable.
  return [
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    vars,
    templateImageTransform,
    dateTransform,
    titleTransform,
    authorImageTransform,
    authorNameTransform,
    authorTitleTransform,
    templateImage,
  ].join("/");
}

function stripEmojis(string: string): string {
  return string.replace(getEmojiRegex(), "").replace(/\s+/g, " ").trim();
}

function doubleEncode(string: string) {
  return encodeURIComponent(encodeURIComponent(string));
}

function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}

interface SocialImageArgs {
  title: string;
  date: string;
  authorName: string;
  authorTitle: string;
}
```

## Fetching the image and sending the response

Now that we have the URL, we can use it to make a request for the image data. There are no fancy tricks here; Remix let's you _use the platform_ directly with the ol' trusty `fetch` API directly from your server.

```ts
// app/routes/img/social.ts
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  // 1. Get blog post data from the URL
  let requestUrl = new URL(request.url);
  let searchParams = new URLSearchParams(requestUrl.search);

  let title = searchParams.get("title");
  let authorName = searchParams.get("authorName");
  let authorTitle = searchParams.get("authorTitle");
  let date = searchParams.get("date");

  // 2. Validate the data
  if (!title || !authorName || !authorTitle || !date) {
    throw json({ error: "Missing required params" }, 400);
  }

  // 3. Construct a URL for a Cloudinary transformation image
  let socialImageUrl = getCloudinarySocialImageUrl({
    title,
    authorName,
    authorTitle,
    date,
  });

  // 4. Fetch the image from Cloudinary
  let resp = await fetch(socialImageUrl, {
    headers: {
      "Content-Type": "image/png",
    },
  });

  // 5. Return a response
  if (resp.status >= 300) {
    // Bad response from Cloudinary. Bail! Bail!
    throw resp;
  }
  return resp;
}
```

## Accessing the image

Now that we've written our loader, we should be able to request our image just like any other remote image on the web. We can access it directly in the browser, or pass it as an attribute to one of our meta tags for social sharing.

## Why create a resource route instead of using the Cloudinary URL directly?

I'm so glad you asked! Using a resource route gives us a few advantages for this case:

- We can mask our Cloudinary cloud and folder names. This makes it more difficult for malicious actors to access our account or abuse its transformation limits.
- We can validate our data and send more tailored responses in case the request fails.
- If we wanted to use a custom static image for a given post, we can check for that in our resource route before handling the Cloudinary request.

## What else can resource routes do for you?

I am biased, but I happen to think tasks like this are the perfect use-case for resource routes, but there are many other things you can explore with them. Folks in the Remix community have shown us how flexible and powerful they truly are.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://t.co/j9kvsdgUI8">https://t.co/j9kvsdgUI8</a>&#39;s css-in-js (<a href="https://t.co/VmcSCq43zQ">https://t.co/VmcSCq43zQ</a>) no longer gets embedded into the head (not great for caching). Now it&#39;s being served via a hashed-n-cached <a href="https://twitter.com/remix_run?ref_src=twsrc%5Etfw">@remix_run</a> resource route. New extracted styles == new hash == cache bust. I can also preload them now, too 😄</p>&mdash; Tanner Linsley (@tannerlinsley) <a href="https://twitter.com/tannerlinsley/status/1470160872907558913?ref_src=twsrc%5Etfw">December 12, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">A simple <a href="https://twitter.com/remix_run?ref_src=twsrc%5Etfw">@remix_run</a> resource route and component to do image optimization: <a href="https://t.co/C18IY30519">https://t.co/C18IY30519</a></p>&mdash; Jacob Ebey (@ebey_jacob) <a href="https://twitter.com/ebey_jacob/status/1476857640797892610?ref_src=twsrc%5Etfw">December 31, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/kentcdodds?ref_src=twsrc%5Etfw">@kentcdodds</a> suggested yesterday in the Remix Discord that you could use <a href="https://twitter.com/remotion_dev?ref_src=twsrc%5Etfw">@remotion_dev</a> and Remix Resource Routes to create dynamic videos. I found the idea fascinating and built a small demo, super easy thanks to the great Remotion Docs. <br><br>DEMO: <a href="https://t.co/utjPfaL8N6">https://t.co/utjPfaL8N6</a></p>&mdash; Lennart Gastler (@lgastler) <a href="https://twitter.com/lgastler/status/1467917659325014028?ref_src=twsrc%5Etfw">December 6, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">up to some mad scientist stuff 🧑‍🔬<br><br>server rendering Svelte in a <a href="https://twitter.com/remix_run?ref_src=twsrc%5Etfw">@remix_run</a> resource route <a href="https://t.co/Mhjf9iusE1">pic.twitter.com/Mhjf9iusE1</a></p>&mdash; austin crim (@crim_codes) <a href="https://twitter.com/crim_codes/status/1466858776154226701?ref_src=twsrc%5Etfw">December 3, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

---

So what will _you_ build with resource routes? If you've got something cool to show off, [Tweet us @remix_run][remix-twitter] or share it with the community in [our Discord server][remix-discord] 💿

[image-template]: /blog-images/posts/dynamic-images-with-remix-resource-routes-and-cloudinary/image-template.png
[final-image]: https://remix.run/img/social?slug=dynamic-preview-images-with-remix-resource-routes-and-cloudinary&siteUrl=http%3A%2F%2Flocalhost%3A3000&title=Dynamic+Images+with+Remix+Resource+Routes+and+Cloudinary&authorName=Chance+Strickland&authorTitle=Software+Engineer&date=July+28th%2C+2022
[contrast-checker]: https://webaim.org/resources/contrastchecker/
[cloudinary-signup]: https://cloudinary.com/users/register/free
[remix-twitter]: https://twitter.com/remix_run
[remix-discord]: https://discord.gg/remix
