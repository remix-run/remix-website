---
meta:
  title: Tutorial | Deploying
---

# Deploying

Alright! Let's get this app into production.

If you're using the firebase starter it's as simple as this command from the root of the project:

```
$ firebase deploy
```

We've got a script in `firebase.json` that runs the build before firebase deploys the project.

If you're using the express starter, you'll need to run the build manually:

```
$ remix-run build
```

That should create two builds, one for the server (`build/`) and one for the browser (`public/build/`). You can now deploy that express app anywhere.

If you want to take it for a test drive locally run:

```
$ NODE_ENV=production node server.js
```

## More to come

We'll be adding more instructions to deploy to many of the cloud service providers out there.

And that's it for our tutorial! We hope it's enough to get you off and running with Remix.
