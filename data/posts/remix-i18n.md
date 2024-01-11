---
title: Remix and i18n
summary: We'll cover how internationalization (i18n) works with Remix. Together, we'll see to understand the impact of i18n, fundamental logic and how to manage i18n more efficiently with Remix.
featured: false
date: 2024-01-31
image: /blog-images/headers/sigmund-EgwhIBec0Ck-unsplash.jpg
imageAlt: A globe close-up photo zooming in to the north America continent.
authors:
  - Arisa Fukuzaki
---

There are many experts discussing about how to make webs better. Accessibility, UI UX, web performance, you name it. You might not hear about internationalization (i18n) as much as other topics, but it is still important to make webs better. In this article, we'll cover how i18n works with Remix and see to understand the impact of i18n, fundamental logic and how to manage i18n more efficiently with Remix.

I also talked about i18n with Remix in my talk at Remix Conf 2023. If you're interested in watching the video version of this article instead, you can find [my i18n talk here][remixconf-arisa].

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/IAMKH8oOLes?si=RVXWYiStu-DQZbS8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## What is i18n?

i18n stands for internationalization. Between the first character, “i,” and the last character, “n,” from this word has 18 characters. In short, i18n is about implementing the structures and features for your applications to be ready to localize content.

## Why we should care about i18n?

There are many reasons why we should care about i18n. The most important reason is that it makes your application more accessible to people who speak different languages. There are interesting numbers and statistics to proof that. For example, 5.07 billion users are using the internet in 2020. That's more than half of the world population. Out of over 5 billion users, 74.1% of the users are accessing the content in any other language than English.

You can find what you read above in this statistics [from Statista][lang-statistics-on-the-internet].

## i18n fundamentals

Before we dive into how i18n works with Remix, let's take a look at the fundamentals of i18n. There are three ways to determin languages and regions in i18n: location of the IP address, [Accept-Language header][accept-lang-mdn] or [Navigator.languages][navigator-langs-mdn], and identifiers in URLs.

### Location of the IP address

This approach is based on the location of the IP address. It's not the most accurate way to determin languages and regions. In fact, it against to provide the best UX for users. For example, if you're traveling to another country, you will see the content in the language of the country you're visiting.

### Accept-Language header or Navigator.languages

This approach is based on the language settings of the browser. It's more accurate than using the location of the IP address. However, this approach provides language information but doesn't provide regional information.

### Identifiers in URLs

This approach is based on the identifiers in URLs. It's the most accurate way to determin languages and regions. It requires more work to implement but it provides the best UX for users. Examples of identifiers in URLs are `https://remix.run/de-at`, `https://remix.run/fr-ca`, etc. This approach is called localized sub-directories.

Technically, you can use different domains, and different URL parameters for different languages and regions to create identifiers in URLs if you don't consider SEO and same-origin policy. But we care about those to make webs better, so we'll focus on localized sub-directories in this article.

## How i18n works with Remix

When you are going to implement i18n with whatever framework, you need to consider if they provide **SEVERAL PRACTICAL & FLEXIBLE options**.

I insist that a lot in [my i18n talk][remixconf-arisa] because otherwise, your DX will be painful and your users also need to sacrifice their UX for some inconvenience due to the technical limitations of the frameworks. I'm not saying that other frameworks are bad. But it's true I had nightmares with other frameworks when I was working on i18n projects, such as not possible to modify slugs programatically, requires to install extra npm packages, etc.

i18n is a complex topic and there's not just one simple way to implement it. That's why we need to have several practical and flexible options to find the best way to implement i18n for each project.

But Remix provides several practical and flexible options for implementing i18n! Let's take a look at how i18n works with Remix.

### 1. remix-18next

remix-i18next is a npm module created by [Sergio Xalambrí][sergio-github] for i18n with Remix. remix-i18next is built on top of i18n JavaScript library, [i18next][i18next]. i18next provides features to localize your product from web to mobile and desktop along with standard i18n features.

I've written a [separate article about remix-i18next][smashing-i18n-article-remix-i18next] if you're interested in learning more how exactly you can use remix-i18next with code snippets.

However, remix-i18next approach requires you to install several additional npm modules and maintain translation JSON files in the source code level and it'll require some efforts to implement localized sub-directories. If you want to make content editors to take more responsibilities to help us with content tasks, you can consider the next approach.

### 2. A combination of Remix & CMS

As I mentined the importance of having **SEVERAL PRACTICAL & FLEXIBLE options**, investigating which CMS to use will be a very important process to have more options to find the best approach for your case. CMSs offer various different approaches to help structuring localized content and manage those content separating from source code.

The numbers of the options and the way to help implementing i18n would be different depending on each CMS. In this article, I'll use an example from [Storyblok](https://www.storyblok.com/) as one of the examples.

Storyblok has four approaches you can choose to structure the content to leave enough room to make i18n implementations flexible and efficient.

1. Folder-level translation
2. Field-level translation
3. Mix of folder-level and field-level translation
4. Space-level translation

[Folder-level translation][folder-level-docs] approach allows you to create a folder for each language and region, and manage content in each folder. In a way, you can create different environments for content editors. At the same time, folder names work as localized sub-directories. Content editors can help you to already visualize to show you how they want to structure localized sub-directories in each language and region from the CMS UI.

![A screenshot of Storyblok UI displaying Japanese, German and English folders to separate different localized content as well as creating localized sub-directory structures][img-folder-level]

It makes it easier for us to implement localized sub-directories as we can simply focus on implementation.
What you can enjoy great DX while you implement i18n with Remix and folder-level translation approach is that you can use Remix's [Splat Routes][splat-routes] to catch all slugs in any nested levels.

I've also written a [separate article about a combination of Remix & CMS with folder-level translation approach][smashing-i18n-article-remix-storyblok] including how you can use Splat Routes for more details.

[Field-level translation][field-level-docs] approach creates one content tree and no need to create stand-alone folders for each language and region. Translatable fields will be stored in the content tree as a separate stand-alone property with suffixes of each language. In short, if you want to apply same page layout for each language and region, you can use this approach to prevent duplicating common pages in several localized content folders. Instead, create one page and localize the content in one content tree.

![A screenshot of Storyblok UI displaying default, Italian, Hong Kong, English, German and Japanese language options to switch different localized home page in one content tree of home page][img-field-level]

To visualize how exactly one content tree stores translatable fields as a separate stand-alone property with suffixes of all languages, you can check out the screenshot of the JSON file for this home page.

As you change the `language` parameter on the URL (i.e. `language=ja` to `language=de` or any other language options from the screenshot above on the Storyblok UI), you can see the JSON for each language and region with coresponding `full_slugs` and `lang`.

![A screenshot of JSON with ja language parameter on the URL with coresponding full_slug and lang with language parameter value][img-JSON-ja]

Storyblok also offers [Links API][links-api-docs] to retrieve links object containing all links.

To enable coresponding live preview on the Storyblok UI, you can install [Advanced Paths app][advanced-paths-app-docs] to configure preview URL programatically for each language and region.

Mixing folder-level and field-level translationtion approaches is also possible. This approach is more for complex and handling many regions such as `de-at`, `de-ch`, `de-de`, etc.

[Space-level translation][space-level-docs] approach is for the case you want to create a separate space for each language and region. This approach simplifies to divide environemnts for content editors and developers. It's good to keep in minds as a way to simplify the environemnts to work.

For example, while you secure the divided environments in each space, you can use [Storyblok CLI][storyblok-cli] and [Management API][mapi-docs] to share components, pages (it's called `story` at Storyblok) and schemas between spaces. It's a good way to keep the consistency of the content structure and components.

I listed up four approaches from one of the CMSs but there are cases that you won't go with CMS approach regardless of your great POC to convince your team and decision makers. (Sometimes, things like making decisions with budjets are out of our hands, right?) In that case, you can consider the next approach.

### 3. Optional Segments

Luckily, Remix provides a built-in feature called [Optional Segments][optional-segments-docs].

[remixconf-arisa]: https://youtu.be/IAMKH8oOLes?si=MxV0A8vaRnBDNh0X
[lang-statistics-on-the-internet]: https://www.statista.com/statistics/262946/most-common-languages-on-the-internet/
[accept-lang-mdn]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
[navigator-langs-mdn]: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages
[sergio-github]: https://github.com/sergiodxa
[i18next]: https://www.i18next.com/
[smashing-i18n-article-remix-i18next]: https://www.smashingmagazine.com/2023/02/internationalization-i18n-right-remix-headless-cms-storyblok/#remix-i18next
[smashing-i18n-article-remix-storyblok]: https://www.smashingmagazine.com/2023/02/internationalization-i18n-right-remix-headless-cms-storyblok/#a-combination-of-remix-and-cms
[folder-level-docs]: https://www.storyblok.com/docs/guide/in-depth/internationalization#folder-level-translation
[img-folder-level]: /blog-images/posts/remix-i18n/folder-level.png
[splat-routes]: https://remix.run/docs/en/main/file-conventions/routes#splat-routes
[field-level-docs]: https://www.storyblok.com/docs/guide/in-depth/internationalization#field-level-translation
[img-field-level]: /blog-images/posts/remix-i18n/field-level.png
[img-JSON-ja]: /blog-images/posts/remix-i18n/JSON-ja.png
[links-api-docs]: https://www.storyblok.com/docs/api/content-delivery/v2#core-resources/links/links
[advanced-paths-app-docs]: https://www.storyblok.com/apps/advanced-paths
[space-level-docs]: https://www.storyblok.com/docs/guide/in-depth/internationalization#space-level-translation
[storyblok-cli]: https://github.com/storyblok/storyblok-cli
[mapi-docs]: https://www.storyblok.com/docs/api/management
[optional-segments-docs]: https://remix.run/docs/en/main/file-conventions/routes#optional-segments