---
title: A Brand New Remix
summary: The thinking and intentionality behind our latest brand evolution, website, and what it says about the future of Remix.
date: 2026-05-04
authors:
  - Tim Quirino
image: /blog-images/headers/brand-new.jpg
ogImage: /blog-images/headers/brand-new.jpg
imageAlt: "Glowing blue particle-rendered Remix “R” logo on a black background."
imageDisableOverlay: true
---

Brands typically change to signal a shift in thinking or reflect a changing audience. Sometimes, it happens as a way to adapt to a different landscape. Some may see this as a way to align with current trends, but with a name like Remix, is it really that surprising that we would want to reinvent ourselves? Everything is rapidly evolving around us, and my goal as the designer on this team was to craft a new identity that would allow us to drive into the future.

## Context & Trigger

![Brand evolution board mapping Remix's Past, Present, and Future across three rows of context cards.](/blog-images/posts/brand-new/frames-brand-thinking.avif)

Ultimately, the trigger — the moment we decided we needed a new brand — was when we established [our philosophy for building Remix 3](https://github.com/remix-run/remix/blob/main/README.md) and beyond.

Since our work is always intentional (and open source), I'm sharing the Figma frames as a way of providing transparency. Any good brand encapsulates the philosophies and ideals of the thing it represents, so in order to arrive at the right solution I needed to recontextualize the problem. In this case, I wanted to see the past, present, and future of Remix from a bird's-eye point of view.

Building *with* the web rather than against it meant the shape of our work was more aerodynamic. Powerful single-purpose modules (or packages) seemed equivalent to precision parts. Since we've always valued the efficiency of lightweight and powerful architectural decisions, performance has always been a priority. The thematic analogy was clear. It was as if our engineering team was building all of the parts to create a new vehicle for building apps and websites. If we were a racing team, then Remix 3 was meant to be a race car, and every kind of builder would be the driver.

## Evolving the Logo

![Logo evolution board grouped into three rows: Evolving the Logo, Preserving the DNA, and Logo in use, showing wordmark explorations and applications.](/blog-images/posts/brand-new/frames-logo-evolution.avif)

The new identity was meant to have a clear lineage from its predecessor, and it came quite naturally as we were putting together the [demo for last year's Remix Jam](/jam/2025/gallery?photo=46). Customizing letterforms from the Kanada typeface also seemed like a nice reference to our parent company's Canadian roots. Speaking of which, this was the first substantial shift in the brand since Remix joined Shopify, so I felt that it was necessary for the two brands to work together in harmony. Our racing theme already nudged the logo and wordmark into an italicized direction, so this worked in our favor.

## Creating a New Website

As I mentioned earlier, the landscape has shifted. With software engineers and web developers no longer being our only audience, we wanted to address builders of all kinds. In a way, we were also building Remix for designers like me. Instead of just talking about building with agents, I wanted to live the experience of building a Remix website alongside an agent. I wanted to vibe code something that would have previously been way too ambitious, and far outside of my comfort zone.

In the past, I would have designed every aspect of this layout in Figma. For the first time in my career, I started with a handful of markdown files in Obsidian to jot down our goals, then went straight to Cursor and got to work using an Alpha build of Remix. 

These were my explicit goals:
- Generate a new content strategy for the way we talk about Remix: who it's for, why it's built this way, and why this is the right call now
- Design a new website with visuals that walk the line between technical abstractions and futuristic visualizations
- Develop a muscle for using the new Remix brand in a way that extends the racing metaphor *just enough*

![A browser window showing the finished Remix website, scrolled down to the second section that highlights a particle model of a racecar, with text that talks about closing the gap between the initial spark and shipping the idea](/blog-images/posts/brand-new/safari-remix-run.avif)

To announce a new brand and release Remix 3 Beta, realistic photography or illustrations didn't make sense. I needed to work with visuals that looked like they were generated within the browser itself.

## Under the Hood

[The site](/) is built on Remix 3 (alpha) — notably without React, using plain TypeScript and the framework's native component model. 

The centerpiece is that morphing particle cloud that reshapes as you scroll between sections: it's a WebGL scene rendered with Three.js, driven by custom GLSL shaders so the heavy lifting happens on the GPU rather than the CPU. Scroll position is mapped to a continuous morph value that interpolates between preset shapes, with the anchor points tied to each section's center so the nav lands you exactly on a preset's "peak." 

![A browser window featuring the Remix Particle Visualizer tool, with configuration and debug panels.](/blog-images/posts/brand-new/safari-remix-particle-visualizer.avif)

Since much of the website experience relied on how this interaction felt, I vibe coded a tool that allowed me to tweak the parameters and optimize the particle models so that the frame rate always stayed north of 60 FPS. [We've published the tool as the Remix Particle Visualizer](https://remix-run.github.io/remix-particle-visualizer/), and clicking the clipboard in the upper right of the UI should allow you to copy a prompt that you can bring to your agent to build something similar.

The 3D engine is lazy-loaded behind a brief loading screen to keep the initial paint light, and everything else — the glow, the projected labels, the soft blur fade at the top of the viewport — is layered as standard DOM over the canvas. There's also a Konami code easter egg that swaps the particles into an alternate shader color mode. Overall it's a fairly GPU-bound architecture, which is what gives it that smooth, continuous feel as you scroll.

## Production Notes & Credits

Being an F1 fan and having discussed racing culture at length in our Discord, [@pcattori](https://github.com/pcattori) suggested the wonderful idea of designing logos for each of our single-purpose modules, as if each package was its own performance part. I thought this was an inspired way to build more visuals for our new brand, something that could convey a similar ethos without feeling too boxed into a singular brand direction.

My early attempts at a wordmark included a lowercase "i", but [@mjackson](https://github.com/mjackson) had the brilliant idea of removing the dot over the "i" to simplify the overall shape of the logo.

We didn't really build a racecar, but if we had, I wanted to make sure it would be a car that made sense. The 3D model I used in the particle visualization is built from a GLB file used for [Shopify Racing](https://racing.shop/), based on the ORECA LMP2 that Shopify founder-driver Tobi Lütke races in.
