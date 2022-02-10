---
draft: true
title: Remix Stacks
summary: The current state of React Server Components their future in Remix.
date: 2022-02-14
image: /blog-images/headers/remix-stacks.jpg
imageAlt: "Stack of pancakes with cream and strawberries"
authors:
  - name: Kent C. Dodds
    avatar: /k.jpg
    title: Co-Founder
---

When you're building a web application, in addition to the web application you're using and all the tooling associated with that (which Remix is happy to provide), you typically need a CI/CD pipeline, a database, and a hosting platform. Lots of our early adopters are frontend developers who aren't accustomed to deploying app and database servers. And frankly even folks who are accustomed to it often don't enjoy the process of getting things set up.

When lightning has struck 🌩 and you're ready to start coding your new mind blowing idea 🤯, the last thing you want is the tedious process of setup to get in between your inspiration and deploying your app.

That's why we're excited to announce the release of **Remix Stacks**: the easiest way to get your Remix application started and ready to deploy! In just a few minutes, we can get your app off the ground and ready to deploy all wired up with a CI/CD pipeline, connected database with a basic data model, and even user authentication!

With this release, we're excited to give you two stacks, with more on the way:

1. Remix Fly Stack
2. Remix Architect (AWS) Stack

For both of these stacks, all you do is run the normal `npx create-remix@latest` and choose them from the CLI. This will generate your project for you and then just pop open the `README.md` to get things running! In both cases, you get a full app that's ready to develop and deploy with GitHub action workflows to automate the deployment process. It even supports a staging environment for your `dev` branch!

<!-- TODO: Here's the Fly Stack in action:

Add a 60 second embedded YouTube video or something here for folks to watch and be amazed
 -->

At Remix, we're fiercely committed to improving the user experience (UX) of your web application. Because developer experience (DX) and your productivity are an important input into that UX, we're working hard to make that excellent. And we're definitely not finished.
