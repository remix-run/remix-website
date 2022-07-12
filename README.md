# Remix Website

## Installation

First setup your `.env` file, use `.env.example` to know what to set.

```sh
npm i
prisma migrate reset
npm run seed
```

Now you should be good to go:

```
npm run dev
```

## Deployment

The production server is always in sync with `main`

```sh
git push origin main
open https://remix.run
```

Pushing the "stage" tag will deploy to [staging](https://remixdotrunstage.fly.dev/blog).

```sh
git checkout my/branch

# move the tag
git tag -f stage

# push it to deploy
git push origin stage -f
```

When you're happy with it, merge your branch into `main` and push.

## Content

Content is synced to the SQLite distributed system from the `main` branch. You do not need to deploy a tag in order to add or update content.

```sh
git push origin main
# watch the app instances pull the new content
fly logs -a remixdotrun
```

**Authoring Blog Articles:**

- Put a markdown file in `data/posts/{your-post-slug}.md`
- Follow the conventions found in other blog articles for author/meta
  - Make sure your author name in the post is the same as the one in `data/authors.yml`
  - If you don't have an author photo yet, create one. [The template is in Figma](https://www.figma.com/file/6G68ZVNbR6bMHl2p8727xi/www.remix.run?node-id=6%3A2).
- Create and optimize any inline blog post image(s) and put them in `/public/blog-images/posts/{your-post-slug}/{image-name}.{format}`
  - @TODO convention for ensuring images are large enough for 1x/2x?
- Create a featured image for the post that shows up on the blog’s index page as well as at the top of each post. Put it in `/public/blog-images/headers/{your-post-slug}.{format}` (this gets referenced in the YAML front-matter for each post).
  - @TODO what is, or should be, the difference between this image and the social share image?

When linking to other posts use `[name](article-slug)`, you don't need to do `[name](/blog/article-slug)`

**Changing page content:**

- Edit markdown files in `content/{pages,other}/{file}.md`
- Push to `main`

## CSS Notes

You'll want the tailwind VSCode plugin fer sure, the hints are amazing.

The color scheme has various shades but we also have a special "brand" rule for each of our brand colors so we don't have to know the specific number of that color like this: `<div className="text-pink-brand" />`.

We want to use Tailwind's default classes as much as possible to avoid a large CSS file. A few things you can do to keep the styles shared:

- Avoid changing anything but the theme in `tailwind.config.js`, no special classes, etc.
- Avoid "inline rules" like `color-[#ccc]` as much as possible.
- Silly HTML (like a wrapper div to add padding on a container) is better than one-off css rules.
