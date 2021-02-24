# remix.run website

## Development

```sh
cd functions
yarn
yarn start
```

Will start up with staging. If you want to goof around w/ production data:

```sh
cd functions
yarn start:production
```

NOTE: this is not "production mode" for the source code, but the production services:

- production firestore
- production authentication
- production stripe

## Deploying

**Make sure to check wich firebase server you're using**

Deploy to staging:

```sh
# if in functions/
cd functions/
yarn use:staging
firebase deploy
```

Deploy to production:

```sh
cd functions/
yarn use:production
firebase deploy
```
