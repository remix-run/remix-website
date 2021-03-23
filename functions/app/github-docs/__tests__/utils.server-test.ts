import { transformVersionsToLatest, getMenu } from "../utils.server";

let config = {
  owner: "ryanflorence",
  repo: "github-docs-template",
  remotePath: "docs",
  localPath: "docs",
  versions: ">=0",
};

it("gets latest versions", async () => {
  let tags = transformVersionsToLatest([
    "2.0.0",
    "2.1.2",
    "2.1.3",
    "1.0.0",
    "1.1.0",
    "1.0.0",
    "0.1.0",
    "0.0.1",
    "0.0.3",
  ]);
  expect(tags).toMatchInlineSnapshot(`
    Array [
      Object {
        "label": "2.x",
        "value": "2.1.3",
      },
      Object {
        "label": "1.x",
        "value": "1.1.0",
      },
      Object {
        "label": "0.1.x",
        "value": "0.1.0",
      },
      Object {
        "label": "0.0.3",
        "value": "0.0.3",
      },
      Object {
        "label": "0.0.1",
        "value": "0.0.1",
      },
    ]
  `);
});

it("builds a cool menu", async () => {
  let menu = await getMenu(config, null);

  expect(menu).toMatchInlineSnapshot(`
    Object {
      "attributes": Object {
        "description": "Remix brings the best of modern web development without leaving behind the fundamental parts that make it great. Deploy server rendered, code split, dynamic-data driven React apps to any cloud service provider. Experience unparalleled performance without the giant build times.",
        "title": "Remix Run Documentation",
      },
      "dirs": Array [
        Object {
          "attributes": Object {
            "order": 1,
            "siblingLinks": true,
            "title": "Tutorial (Start Here!)",
          },
          "files": Array [
            Object {
              "attributes": Object {
                "description": "Get started with Remix, first step is installing.",
                "order": 1,
                "title": "Installing Remix",
              },
              "name": "1-installation.md",
              "path": "/tutorial/1-installation",
              "title": "Installing Remix",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "order": 2,
                "title": "Defining Routes",
              },
              "name": "2-defining-routes.md",
              "path": "/tutorial/2-defining-routes",
              "title": "Defining Routes",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "order": 3,
                "title": "Loading Data",
              },
              "name": "3-loading-data.md",
              "path": "/tutorial/3-loading-data",
              "title": "Loading Data",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "order": 4,
                "title": "Nested Routes and Params",
              },
              "name": "4-nested-routes-params.md",
              "path": "/tutorial/4-nested-routes-params",
              "title": "Nested Routes and Params",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "order": 5,
                "title": "Styling",
              },
              "name": "5-styling.md",
              "path": "/tutorial/5-styling",
              "title": "Styling",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "order": 6,
                "title": "Data Mutations",
              },
              "name": "6-mutations.md",
              "path": "/tutorial/6-mutations",
              "title": "Data Mutations",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "order": 7,
                "title": "Deploying",
              },
              "name": "7-deploying.md",
              "path": "/tutorial/7-deploying",
              "title": "Deploying",
              "type": "file",
            },
          ],
          "hasIndex": true,
          "name": "tutorial",
          "path": "/tutorial",
          "title": "Tutorial (Start Here!)",
          "type": "dir",
        },
        Object {
          "attributes": Object {
            "title": "API",
          },
          "dirs": Array [
            Object {
              "attributes": Object {
                "title": "Environments",
              },
              "files": Array [
                Object {
                  "attributes": Object {
                    "title": "@remix-run/node",
                  },
                  "name": "node.md",
                  "path": "/api/environments/node",
                  "title": "@remix-run/node",
                  "type": "file",
                },
                Object {
                  "attributes": Object {
                    "title": "@remix-run/worker",
                  },
                  "name": "worker.md",
                  "path": "/api/environments/worker",
                  "title": "@remix-run/worker",
                  "type": "file",
                },
              ],
              "hasIndex": false,
              "name": "environments",
              "path": "/api/environments",
              "title": "Environments",
              "type": "dir",
            },
            Object {
              "attributes": Object {
                "title": "Renderers",
              },
              "files": Array [
                Object {
                  "attributes": Object {
                    "title": "@remix-run/react",
                  },
                  "name": "react.md",
                  "path": "/api/renderers/react",
                  "title": "@remix-run/react",
                  "type": "file",
                },
              ],
              "hasIndex": false,
              "name": "renderers",
              "path": "/api/renderers",
              "title": "Renderers",
              "type": "dir",
            },
            Object {
              "attributes": Object {
                "title": "Servers",
              },
              "files": Array [
                Object {
                  "attributes": Object {
                    "title": "@remix-run/architect",
                  },
                  "name": "architect.md",
                  "path": "/api/servers/architect",
                  "title": "@remix-run/architect",
                  "type": "file",
                },
                Object {
                  "attributes": Object {
                    "title": "@remix-run/cloudflare",
                  },
                  "name": "cloudflare.md",
                  "path": "/api/servers/cloudflare",
                  "title": "@remix-run/cloudflare",
                  "type": "file",
                },
                Object {
                  "attributes": Object {
                    "title": "@remix-run/express",
                  },
                  "name": "express.md",
                  "path": "/api/servers/express",
                  "title": "@remix-run/express",
                  "type": "file",
                },
                Object {
                  "attributes": Object {
                    "title": "@remix-run/vercel",
                  },
                  "name": "vercel.md",
                  "path": "/api/servers/vercel",
                  "title": "@remix-run/vercel",
                  "type": "file",
                },
              ],
              "hasIndex": false,
              "name": "servers",
              "path": "/api/servers",
              "title": "Servers",
              "type": "dir",
            },
          ],
          "files": Array [
            Object {
              "attributes": Object {
                "title": "@remix-run/dev",
              },
              "name": "dev.md",
              "path": "/api/dev",
              "title": "@remix-run/dev",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "title": "Conventions",
              },
              "name": "conventions.md",
              "path": "/api/conventions",
              "title": "Conventions",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "title": "remix.config.js",
              },
              "name": "config.md",
              "path": "/api/config",
              "title": "remix.config.js",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "title": "Route Module",
              },
              "name": "route-module.md",
              "path": "/api/route-module",
              "title": "Route Module",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "title": "Web Fetch API",
              },
              "name": "fetch.md",
              "path": "/api/fetch",
              "title": "Web Fetch API",
              "type": "file",
            },
          ],
          "hasIndex": false,
          "name": "api",
          "path": "/api",
          "title": "API",
          "type": "dir",
        },
        Object {
          "attributes": Object {
            "title": "Deployment",
          },
          "files": Array [
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Architect",
              },
              "name": "architect.md",
              "path": "/deployment/architect",
              "title": "Architect",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Azure",
              },
              "name": "azure.md",
              "path": "/deployment/azure",
              "title": "Azure",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Express",
              },
              "name": "express.md",
              "path": "/deployment/express",
              "title": "Express",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Firebase",
              },
              "name": "firebase.md",
              "path": "/deployment/firebase",
              "title": "Firebase",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Netlify",
              },
              "name": "netlify.md",
              "path": "/deployment/netlify",
              "title": "Netlify",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Vercel",
              },
              "name": "vercel.md",
              "path": "/deployment/vercel",
              "title": "Vercel",
              "type": "file",
            },
          ],
          "hasIndex": false,
          "name": "deployment",
          "path": "/deployment",
          "title": "Deployment",
          "type": "dir",
        },
        Object {
          "attributes": Object {
            "title": "Guides",
          },
          "files": Array [
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Authentications",
              },
              "name": "authentication.md",
              "path": "/guides/authentication",
              "title": "Authentications",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "title": "Disabling JavaScript",
              },
              "name": "disabling-javascript.md",
              "path": "/guides/disabling-javascript",
              "title": "Disabling JavaScript",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Headers",
              },
              "name": "headers.md",
              "path": "/guides/headers",
              "title": "Headers",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "HTML Meta",
              },
              "name": "meta.md",
              "path": "/guides/meta",
              "title": "HTML Meta",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "title": "MDX",
              },
              "name": "mdx.md",
              "path": "/guides/mdx",
              "title": "MDX",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "title": "Mutations with Actions and Form",
              },
              "name": "mutations.md",
              "path": "/guides/mutations",
              "title": "Mutations with Actions and Form",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Not Found",
              },
              "name": "not-found.md",
              "path": "/guides/not-found",
              "title": "Not Found",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Performance",
              },
              "name": "performance.md",
              "path": "/guides/performance",
              "title": "Performance",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "title": "PostCSS",
              },
              "name": "postcss.md",
              "path": "/guides/postcss",
              "title": "PostCSS",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Redirecting",
              },
              "name": "redirecting.md",
              "path": "/guides/redirecting",
              "title": "Redirecting",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "description": "In Remix, routes are more than just the page. When routes are nested we're able to know a little more about your app than just a single page, and do a lot more because of it.",
                "title": "Routing",
              },
              "name": "routing.md",
              "path": "/guides/routing",
              "title": "Routing",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "title": "Sessions",
              },
              "name": "sessions.md",
              "path": "/guides/sessions",
              "title": "Sessions",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "disabled": true,
                "title": "Styling",
              },
              "name": "styling.md",
              "path": "/guides/styling",
              "title": "Styling",
              "type": "file",
            },
          ],
          "hasIndex": false,
          "name": "guides",
          "path": "/guides",
          "title": "Guides",
          "type": "dir",
        },
        Object {
          "attributes": Object {
            "title": "Release History",
          },
          "files": Array [
            Object {
              "attributes": Object {
                "published": 2021-02-17T00:00:00.000Z,
              },
              "name": "v0.13.0.md",
              "path": "/releases/v0.13.0",
              "title": "v0.13.0",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "published": 2021-02-11T00:00:00.000Z,
              },
              "name": "v0.12.0.md",
              "path": "/releases/v0.12.0",
              "title": "v0.12.0",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "published": 2021-02-04T00:00:00.000Z,
              },
              "name": "v0.11.0.md",
              "path": "/releases/v0.11.0",
              "title": "v0.11.0",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "published": 2021-01-27T00:00:00.000Z,
              },
              "name": "v0.10.0.md",
              "path": "/releases/v0.10.0",
              "title": "v0.10.0",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "published": 2021-01-14T00:00:00.000Z,
              },
              "name": "v0.9.0.md",
              "path": "/releases/v0.9.0",
              "title": "v0.9.0",
              "type": "file",
            },
            Object {
              "attributes": Object {
                "published": 2020-11-25T00:00:00.000Z,
              },
              "name": "v0.8.0.md",
              "path": "/releases/v0.8.0",
              "title": "v0.8.0",
              "type": "file",
            },
          ],
          "hasIndex": false,
          "name": "releases",
          "path": "/releases",
          "title": "Release History",
          "type": "dir",
        },
      ],
      "files": Array [
        Object {
          "attributes": Object {
            "title": "Not Found",
          },
          "name": "404.md",
          "path": "/404",
          "title": "Not Found",
          "type": "file",
        },
      ],
      "hasIndex": true,
      "name": "root",
      "path": "",
      "title": "Remix Run Documentation",
      "type": "dir",
    }
  `);
});
