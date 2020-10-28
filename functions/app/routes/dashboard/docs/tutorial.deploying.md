---
meta:
  title: Deploying | Remix Tutorial
---

# Deploying

We are working on making deployment to different cloud service providers a breeze, but at the moment the only one that we've got ready is Firebase. From the starter repos you can use the service's own tools, like:

```bash
$ firebase deploy
```

We are actively working on starters repos to help you deploy to the following providers before the 1.0 release:

- Firebase
- Vercel
- AWS Amplify
- Architect
- Azure
- Netlify

We'll have starter templates and dedicated docs to each platform, as well as docs on general deployment strategies to anywhere (all we need is an http request handler and a place for static assets).

We're also working to get Remix running in worker environments like Cloudflare workers, but that may be a bit later.

## Deploying an express app:

The app we just built is an express app. You can deploy this app anywhere you can deploy an express app.

First run the build:

```
npm run build
```

This builds your app in two places: `build/*` for the server rendering version, and `public/build/*` for the browser. Remix doesn't touch your loaders directory.

You should now be able to run it in production mode:

```bash
NODE_ENV=production node server.js
```
