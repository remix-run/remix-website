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

```sh
# production
git push origin master

# staging
git checkout -b staging
# feel free to force push over staging at any time
git push origin staging -f
```
