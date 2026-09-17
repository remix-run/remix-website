import type { RemixNode } from "remix/ui";
import { CodeSnippet } from "./code-snippet.tsx";

export type StackExample = {
  id: string;
  label: string;
  title: string;
  body: RemixNode;
  code: string;
  filename?: string;
  animation?: AnimationKind;
  component?: ComponentKind;
};

export type StackExplorerCodeToken = [content: string, color?: string];

export type StackExplorerCodeHighlights = Record<
  string,
  StackExplorerCodeToken[]
>;

export type AnimationKind = "presence" | "layout" | "spring" | "tween";
export type ComponentKind =
  | "menus"
  | "combobox"
  | "select"
  | "tabs"
  | "accordion"
  | "popovers"
  | "toggle"
  | "listbox";
export type StackCategory = {
  id: string;
  label: string;
  introTitle?: string;
  introBody?: RemixNode;
  showExampleCopy?: boolean;
  examples: readonly StackExample[];
};

export const stackCategories = [
  {
    id: "server",
    label: "Server",
    introTitle: "Build a complete server with Web APIs",
    introBody:
      "Route standard web Requests through middleware and typed controllers, then return standard Responses for HTML, JSON, redirects, files, and streams.",
    showExampleCopy: true,
    examples: [
      {
        id: "request",
        label: "Request",
        title: "Receive a standard Request",
        body: "Your server adapter turns an incoming HTTP request into a Web Request, then hands it to the router. The request remains the common language all the way through.",
        code: `import { createRequestListener } from "remix/node-fetch-server"
import { router } from "./app/router.ts"

let server = http.createServer(
  createRequestListener(router.fetch),
)

server.listen(3000)`,
      },
      {
        id: "middleware",
        label: "Middleware",
        title: "Run middleware before and after your routes",
        body: "Middleware runs before route matching. Each layer can enrich the request context, wrap the response, or answer early when it owns the request.",
        code: `import { createRouter } from "remix/router"
import { compression } from "remix/middleware/compression"
import { formData } from "remix/middleware/form-data"
import { logger } from "remix/middleware/logger"
import { session } from "remix/middleware/session"

const router = createRouter({
  middleware: [
    logger(),
    compression(),
    formData(),
    session(cookie, storage),
  ],
})`,
      },
      {
        id: "routes",
        label: "Routes",
        title: "Define your routes as data",
        body: "Routes name the paths and parameters your app accepts. Use the same typed contract to match requests, build links, submit forms, and redirect without reparsing URLs.",
        code: `import { get, route } from "remix/routes"

export const routes = route({
  albums: {
    show: get("/albums/:albumId"),
  },
})`,
      },
      {
        id: "resources",
        label: "Resources",
        title: "Generate routes for a resource",
        body: "Start with conventional routes for a collection, then keep only the operations your app needs. Every route remains named and type-safe.",
        code: `import { resources, route } from "remix/routes"

export const routes = route({
  albums: resources("albums", {
    only: ["index", "show", "create"],
  }),
})`,
      },
      {
        id: "controllers",
        label: "Controllers",
        title: "Map controller logic to routes",
        body: "Controllers turn a route map into complete request handling. Remix checks that each route has an action, rejects unknown names, and gives each action its matching typed params and request context.",
        code: `import { createController } from "remix/router"
import { redirect } from "remix/response/redirect"

export const albumsController = createController(routes.albums, {
  actions: {
    async index({ get }) {
      let allAlbums = await get(db).findMany(albums)
      return render(<AlbumList albums={allAlbums} />)
    },
    async show({ params, get }) {
      let album = await get(db).find(params.albumId)
      return render(<AlbumPage album={album} />)
    },
    async create({ get }) {
      let album = await get(db).create(albums, input)
      return redirect(routes.albums.show.href({ albumId: album.id }))
    },
  },
})

router.map(routes.albums, albumsController)`,
      },
      {
        id: "rendering",
        label: "Rendering",
        title: "Stream UI from the server",
        body: "Render JSX on the server and return it as an HTML response. The renderer produces a standard web stream that fits directly into the platform Response API.",
        filename: "render.tsx",
        code: `import { createHtmlResponse } from "remix/response/html"
import { renderToStream } from "remix/ui/server"

async function show({ params, get }) {
  let album = await get(db).find(params.albumId)

  let stream = renderToStream(
    <AlbumPage album={album} />,
  )

  return createHtmlResponse(stream)
}`,
      },
      {
        id: "responses",
        label: "Responses",
        title: "Return a standard Response",
        body: "Render pages with the status they need, redirect after mutations, or return a standard Response when an endpoint needs complete control.",
        code: `import { redirect } from "remix/response/redirect"

async function create({ get }) {
  let album = await get(db).create(albums, input)

  return redirect(
    routes.albums.show.href({ albumId: album.id }),
    303,
  )
}`,
      },
    ],
  },
  {
    id: "data",
    label: "Data",
    introTitle: "Manage your database with type-safe APIs",
    introBody:
      "Connect to SQLite, PostgreSQL, or MySQL, then define schemas, run migrations, read and write records, compose queries, validate input and manage uploads with one type-safe set of tools.",
    showExampleCopy: true,
    examples: [
      {
        id: "databases",
        label: "Databases",
        title: "Create a typed database connection",
        body: "Use the same typed data API with SQLite, PostgreSQL, or MySQL. Choose the driver for your runtime and keep the rest of your application code consistent.",
        filename: "database.ts",
        code: `import { createPostgresDatabase } from "remix/data-table/postgres"

import { pool } from "./postgres.ts"

export let db = createPostgresDatabase(pool)`,
      },
      {
        id: "migrations",
        label: "Migrations",
        title: "Keep database changes in migrations",
        body: "Evolve your schema with ordered up and down SQL, built-in database lifecycle commands, checksum drift detection, and transactional execution where supported.",
        filename: "migrate.ts",
        code: `import { loadMigrations } from "remix/data-table/migrations/node"

let migrations = await loadMigrations(
  "./db/migrations",
)

await db.migrate(migrations)`,
      },
      {
        id: "tables",
        label: "Tables",
        title: "Model relational data in TypeScript",
        body: "Describe real tables with typed columns, constraints, and named relationships. The same definitions drive type-safe reads and writes across your app.",
        code: `import { belongsTo, column as c, table } from "remix/data-table"
import { artists } from "./artists.ts"

export const albums = table({
  name: "albums",
  columns: {
    id: c.integer().primaryKey(),
    title: c.text().notNull(),
    artistId: c.integer()
      .references("artists", "id"),
    year: c.integer(),
  },
})

export const albumArtist = belongsTo(albums, artists)
`,
      },
      {
        id: "crud",
        label: "CRUD",
        title: "Read and write records directly",
        body: "Use focused helpers when you do not need to build a full query. Find records and create, update, or delete them through the same typed database API.",
        code: `import { albums } from "./schema.ts"

let allAlbums = await db.findMany(albums, {
  where: { artistId },
  orderBy: ["year", "desc"],
})

let thriller = await db.create(albums, {
  title: "Thriller",
  artistId,
  year: 1983,
})`,
      },
      {
        id: "queries",
        label: "Query builder",
        title: "Build typed SQL queries",
        body: "Compose conditions, ordering, joins, projections, and related records with a reusable query object that stays type-safe across supported SQL dialects.",
        code: `import { albumArtist, albums } from "./schema.ts"

let albumsByArtist = await db
  .query(albums)
  .where({ artistId })
  .with({ artist: albumArtist })
  .orderBy("year", "desc")
  .all()`,
      },
      {
        id: "sql",
        label: "SQL",
        title: "Drop down to SQL when needed",
        body: "Reach for raw SQL when a database-specific or unusually complex query is the clearest tool. Values stay safely parameterized for the active dialect.",
        code: `import { sql } from "remix/data-table"

let albums = await db.exec(sql\`
  select id, title
  from albums
  where artist_id = \${artistId}
\`)`,
      },
      {
        id: "transactions",
        label: "Transactions",
        title: "Keep related writes together",
        body: "Run related reads and writes through one transaction. If one step cannot finish, Remix rolls the whole unit of work back.",
        filename: "checkout.ts",
        code: `await db.transaction(async (tx) => {
  let order = await tx.create(
    orders,
    { userId, status: "pending" },
    { returnRow: true },
  )

  await tx.create(orderItems, {
    orderId: order.id,
    albumId,
  })
})`,
      },
      {
        id: "validation",
        label: "Validation",
        title: "Validate input at the boundary",
        body: "Parse request data into a typed value and keep the invalid path explicit, local, and easy to render as a normal HTTP response.",
        code: `import * as s from "remix/data-schema"
import * as c from "remix/data-schema/coerce"
import * as f from "remix/data-schema/form-data"

const albumSchema = f.object({
  title: f.field(s.string()),
  year: f.field(c.number()),
})

let result = s.parseSafe(albumSchema, get(FormData))

if (!result.success) {
  return render(<NewAlbumPage errors={result.issues} />, {
    status: 400,
  })
}`,
      },
      {
        id: "uploads",
        label: "Uploads",
        title: "Receive files through standard forms",
        body: "Stream request data into local disk, memory, or S3 storage through the standard File interface.",
        code: `import { parseFormData } from "remix/form-data-parser"

let formData = await parseFormData(request, {
  async upload(file) {
    return uploads.set(file.name, file)
  },
})

let cover = formData.get("cover")
if (cover instanceof File) {
  await saveCover(cover)
}`,
      },
    ],
  },
  {
    id: "auth",
    label: "Auth",
    introTitle: "Authenticate users and manage sessions",
    introBody:
      "Authenticate users with credentials or external providers, resolve each request to a typed identity, protect routes with middleware, and keep session data on the server while the browser holds only a secure session cookie.",
    showExampleCopy: true,
    examples: [
      {
        id: "identity",
        label: "Identity",
        title: "Resolve each request to an identity",
        body: "Authentication middleware turns session, bearer-token, or custom credentials into a typed identity that every route can read.",
        filename: "auth.ts",
        code: `import {
  auth,
  createSessionAuthScheme,
} from "remix/middleware/auth"

export let loadAuth = auth({
  schemes: [createSessionAuthScheme({
    read: (session) => session.get("auth"),
    verify: (value) => users.find(value.userId),
  })],
})`,
      },
      {
        id: "credentials",
        label: "Credentials",
        title: "Build a standard password login",
        body: "Verify credentials, establish the authenticated session, and redirect. Failed credentials stay an ordinary, renderable response.",
        code: `import {
  completeAuth,
  verifyCredentials,
} from "remix/auth"
import { redirect } from "remix/response/redirect"

async function login(context) {
  let user = await verifyCredentials(provider, context)
  if (!user) return render(<LoginPage />, { status: 400 })

  let session = completeAuth(context)
  session.set("auth", { userId: user.id })
  return redirect(routes.account.href())
}`,
      },
      {
        id: "oauth",
        label: "Providers",
        title: "Add external sign-in providers",
        body: "Configure common providers with built-in helpers. Remix handles the external sign-in flow, then your app creates its own authenticated session.",
        filename: "github.ts",
        code: `import {
  createGitHubAuthProvider,
  startExternalAuth,
} from "remix/auth"

let github = createGitHubAuthProvider({
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  redirectUri: new URL(
    "/auth/github/callback",
    env.APP_ORIGIN,
  ),
})

export function login(context) {
  return startExternalAuth(github, context)
}`,
      },
      {
        id: "sessions",
        label: "Sessions",
        title: "Persist state between requests",
        body: "Read, update, flash, and rotate per-browser state without exposing implementation details to the client.",
        code: `import { redirect } from "remix/response/redirect"
import { Session } from "remix/session"

async function addToCart({ get, params }) {
  let session = get(Session)
  let cart = session.get("cart") ?? []

  session.set("cart", [...cart, params.productId])
  session.flash("message", "Added to cart")
  return redirect(routes.cart.href())
}`,
      },
      {
        id: "protection",
        label: "Access control",
        title: "Protect routes and data",
        body: "Gate route areas with middleware, then keep resource ownership checks beside the data they protect.",
        code: `import { Auth, requireAuth } from "remix/middleware/auth"
import { createController } from "remix/router"

const account = createController(routes.account, {
  middleware: [requireAuth()],
  actions: {
    async index({ get }) {
      let auth = get(Auth)
      return render(<AccountPage user={auth.identity} />)
    },
  },
})`,
      },
    ],
  },
  {
    id: "assets",
    label: "Assets",
    introTitle: "Serve source modules without a build step",
    introBody:
      "Compile TypeScript, JavaScript, and CSS on demand, serve native browser modules with import maps and independently fingerprinted dependencies, dynamically transform files, and hot reload code instantly during development.",
    showExampleCopy: true,
    examples: [
      {
        id: "asset-server",
        label: "Server",
        title: "Configure the asset pipeline",
        body: "Choose which source files and packages are browser-accessible, configure how they’re compiled, and mount the asset server in your application.",
        filename: "assets.ts",
        code: `import { createAssetServer } from "remix/assets"

export const assets = createAssetServer({
  basePath: "/assets",
  allowFiles: ["app/**/public/**"],
  allowPackages: ["remix"],
  target: { es: "2020", safari: "16.4" },
  sourceMaps: "external",
})

router.get("/assets/*", ({ request }) =>
  assets.fetch(request)
)`,
      },
      {
        id: "typescript",
        label: "TypeScript",
        title: "Compile TypeScript on request",
        body: "Turn TypeScript and JSX source into browser-ready module entries on request, with optional source maps and minification. Each source module remains independently served and cached.",
        filename: "asset-entry.ts",
        code: `import { assets } from "./assets.ts"

let entry = await assets.getScriptEntry(
  "app/actions/player/public/player.ts",
)`,
      },
      {
        id: "caching",
        label: "Caching",
        title: "Keep unchanged assets cached",
        body: "Content fingerprints give every production asset an immutable URL. Browsers can cache it for a year because changed content always gets a new address.",
        filename: "assets.ts",
        code: `import { createAssetServer } from "remix/assets"

let assets = createAssetServer({
  watch: false,
  fingerprint: true,
})`,
      },
      {
        id: "import-maps",
        label: "Import maps",
        title: "Change one module and keep the rest cached",
        body: "Your imports stay the same while the import map updates each module’s fingerprinted file URL. Only changed modules need new cache entries.",
        filename: "document.tsx",
        code: `import { ImportMap } from "remix/ui/server"
import { assets } from "./assets.ts"

let { href, importMap } =
  await assets.getScriptEntry(
    "app/actions/public/entry.ts",
  )

<ImportMap value={importMap} />
<script type="module" src={href} />`,
      },
      {
        id: "preloads",
        label: "Preloads",
        title: "Start loading modules early",
        body: "A script entry includes preload URLs for its dependencies, letting the browser fetch the module graph while it parses the document.",
        filename: "document.tsx",
        code: `import { ImportMap } from "remix/ui/server"
import { assets } from "./assets.ts"

let { href, importMap, preloads } =
  await assets.getScriptEntry(
    "app/actions/public/entry.ts",
  )

<ImportMap value={importMap} />
{preloads.map((href) => (
  <link rel="modulepreload" href={href} />
))}
<script type="module" src={href} />`,
      },
      {
        id: "css",
        label: "CSS",
        title: "Load CSS through the asset server",
        body: "Compile CSS on request and rewrite local imports, images, fonts, and other URLs through the same asset pipeline.",
        filename: "app.css",
        code: `@import "./reset.css";

.hero {
  background-image: url("./hero.png");
}`,
      },
      {
        id: "asset-files",
        label: "Files",
        title: "Serve and transform files",
        body: "Opt images and fonts into the asset graph, keep browser access explicit, and generate transformed URLs when a file needs another format.",
        filename: "assets.ts",
        code: `import {
  createAssetServer,
  defineFileTransform,
} from "remix/assets"

let assets = createAssetServer({
  basePath: "/assets",
  allowFiles: ["app/**/public/**"],
  files: {
    extensions: [".svg", ".png", ".woff2"],
    transforms: {
      webp: defineFileTransform({
        extensions: [".png"],
        async transform(bytes) {
          return {
            content: await toWebp(bytes),
            extension: ".webp",
          }
        },
      }),
    },
  },
})`,
      },
      {
        id: "hmr",
        label: "HMR",
        title: "See component changes without a full reload",
        body: "During development, Remix swaps compatible component implementations in place, preserving their identity and local state. Other server changes fall back to a coordinated restart when needed.",
        filename: "assets.ts",
        code: `import { createAssetServer } from "remix/assets"
import { uiHmr } from "remix/ui-hmr/assets"

let assets = createAssetServer({
  basePath: "/assets",
  allowFiles: ["app/**/public/**"],
  watch: true,
  hmr: async () =>
    (await import("remix/node-hmr/runtime"))
      .createBrowserHmrChannel(),
  scripts: {
    loaders: [uiHmr()],
  },
})`,
      },
    ],
  },
  {
    id: "ui",
    label: "UI",
    introTitle: "Build rich interfaces with a simpler UI model",
    introBody:
      "Render JSX-based components on the server, hydrate client entry components, update independent page regions via the Frame component, manage client state with regular variables and explicit updates, and optionally run your entire UI client-side.",
    showExampleCopy: true,
    examples: [
      {
        id: "component-model",
        label: "Component model",
        title: "Keep components on the server by default",
        body: "Component code stays on the server unless a component specifically needs browser behavior.",
        filename: "album-card.tsx",
        code: `import { type Handle } from "remix/ui"

function AlbumCard(
  handle: Handle<{ album: Album }>,
) {
  return () => (
    <article>
      <h2>{handle.props.album.title}</h2>
      <p>{handle.props.album.artist} ({handle.props.album.year})</p>
    </article>
  )
}`,
      },
      {
        id: "hydration",
        label: "Hydration",
        title: "Hydrate a browser enhancement",
        body: (
          <>
            Mark the components that need events or browser APIs with{" "}
            <CodeSnippet>clientEntry()</CodeSnippet>. Remix renders them on the
            server, then hydrates that individual component in place.
          </>
        ),
        filename: "copy-link.tsx",
        code: `import { clientEntry, on, type Handle } from "remix/ui"

export let CopyLink = clientEntry(
  import.meta.url,
  function CopyLink(handle: Handle<{ href: string }>) {
    return () => (
      <button mix={on("click", () => {
        navigator.clipboard.writeText(handle.props.href)
      })}>
        Copy link
      </button>
    )
  },
)`,
      },
      {
        id: "state",
        label: "State",
        title: "Keep state in ordinary variables",
        body: "Keep local component state in regular JavaScript variables, then explicitly schedule a render when it changes. There are no hooks, state containers or implicit reactivity to learn.",
        filename: "counter.tsx",
        code: `import { clientEntry, on, type Handle } from "remix/ui"

export let Counter = clientEntry(
  import.meta.url,
  function Counter(handle: Handle) {
    let count = 0

    return () => (
      <button mix={on("click", () => {
        count++
        handle.update()
      })}>
        Count: {count}
      </button>
    )
  },
)`,
      },
      {
        id: "frames",
        label: "Frames",
        title: "Give page regions their own routes",
        body: (
          <>
            A <CodeSnippet>{"<Frame>"}</CodeSnippet> connects a region of the
            page to its own route. Render it during the initial request or
            stream it later, then reload it or point it at another route without
            replacing the surrounding UI.
          </>
        ),
        filename: "dashboard.tsx",
        code: `import { Frame } from "remix/ui"
import { routes } from "../routes.ts"

function Dashboard() {
  return () => (
    <main>
      <h1>Dashboard</h1>
      <Frame
        name="activity"
        src={routes.activity.href()}
        fallback={<p>Loading activity…</p>}
      />
    </main>
  )
}`,
      },
      {
        id: "mixins",
        label: "Mixins",
        title: "Enhance an element in place with mixins",
        body: "Attach events, attributes, navigation, refs, and reusable behaviors without wrapping or replacing the host element.",
        filename: "save-button.tsx",
        code: `import { attrs, on } from "remix/ui"

<button
  mix={[
    attrs({ "aria-label": "Save draft" }),
    on("click", (_, signal) =>
      saveDraft({ signal })
    ),
  ]}
>
  Save changes
</button>`,
      },
      {
        id: "styling",
        label: "Styling",
        title: "Define dynamic styling inline in JavaScript",
        body: "Write colocated styles as data and let Remix produce static, browser-native CSS, both on the server and dynamically in the browser.",
        filename: "button.tsx",
        code: `import { css } from "remix/ui"

<button
  mix={css({
    width: "100%",
    color: "white",
    background: "blue",
    "&:hover": { background: "navy" },
    "@media (min-width: 640px)": {
      width: "auto",
    },
  })}
>
  Save changes
</button>`,
      },
      {
        id: "context",
        label: "Context",
        title: "Any component can provide context",
        body: "Keep shared state close to the part of the tree that owns it, without passing props through every layer.",
        filename: "theme.tsx",
        code: `import { type Handle } from "remix/ui"

function App(
  handle: Handle<Record<string, never>, { color: string }>,
) {
  handle.context.set({ color: "blue" })

  return () => <Page />
}

function Header(handle: Handle) {
  let theme = handle.context.get(App)

  return () => <header data-theme={theme.color} />
}`,
      },
      {
        id: "forms",
        label: "Forms",
        title: "Send mutations through ordinary forms",
        body: "Post directly to typed routes and let the server return HTML, validation errors, or redirects, and optionally layer on client behavior.",
        filename: "new-album.tsx",
        code: `<form
  method="post"
  action={routes.albums.create.href()}
>
  <label>
    Title
    <input name="title" required />
  </label>
  <button type="submit">Add album</button>
</form>`,
      },
      {
        id: "spa",
        label: "SPA",
        title: "Optionally render your entire app on the client",
        body: "Run the same Remix route contract in the browser, including middleware, redirects, and standard Responses.",
        filename: "entry.tsx",
        code: `import { createRouter } from "remix/router"
import { render, run } from "remix/spa"

let router = createRouter({
  middleware: [render()],
})

let app = run(router, {
  fallback: <Loading />,
})

await app.ready()`,
      },
    ],
  },
  {
    id: "primitives",
    label: "Primitives",
    introTitle: "Create accessible controls from your own markup",
    introBody:
      "Compose unstyled primitives and mixins with your own markup and CSS. Remix handles focus, keyboard navigation, selection, dismissal, and the interaction details people expect.",
    examples: [
      {
        id: "menus",
        label: "Menu",
        title: "Build keyboard-accessible action menus",
        body: "Attach menu behavior to your own trigger, surface, and item elements. Remix handles focus, keyboard navigation, typeahead, checked items, and selection events while your CSS owns the presentation.",
        filename: "album-actions.tsx",
        component: "menus",
        code: `import { css } from "remix/ui"
import * as menu from "remix/ui/menu/primitives"

<menu.Context label="Album actions">
  <button type="button" mix={[menu.trigger(), css({/*...*/})]}>
    Actions
  </button>
  <div mix={[menu.popover(), css({/*...*/})]}>
    <div mix={[menu.list(), css({/*...*/})]}>
      <div mix={[menu.item({ name: "edit" }), css({/*...*/})]}>
        Edit album
      </div>
      <div mix={[menu.item({
        name: "favourite", type: "checkbox", checked: true,
      }), css({/*...*/})]}>
        Favourite
      </div>
    </div>
  </div>
</menu.Context>`,
      },
      {
        id: "combobox",
        label: "Combobox",
        title: "Add searchable selection to your markup",
        body: "Connect an input, filtered option list, floating surface, and form value. Remix coordinates draft text, keyboard focus, selection, dismissal, and the committed value without owning their appearance.",
        filename: "artist-picker.tsx",
        component: "combobox",
        code: `import { css } from "remix/ui"
import * as combobox from "remix/ui/combobox/primitives"

<combobox.Context name="artist">
  <input
    placeholder="Search artists"
    mix={[combobox.input(), css({/*...*/})]}
  />
  <div mix={[combobox.popover(), css({/*...*/})]}>
    <div mix={[combobox.list(), css({/*...*/})]}>
      <div mix={[combobox.option({
        label: "Michael Jackson", value: "mj",
      }), css({/*...*/})]}>Michael Jackson</div>
      <div mix={[combobox.option({
        label: "Quincy Jones", value: "qj",
      }), css({/*...*/})]}>Quincy Jones</div>
    </div>
  </div>
  <input mix={combobox.hiddenInput()} />
</combobox.Context>`,
      },
      {
        id: "select",
        label: "Select",
        title: "Compose a button-triggered value picker",
        body: "Build a select from your own trigger, popup, options, and hidden form input. Remix supplies the accessible relationships, typeahead, focus movement, and committed value.",
        filename: "release-format.tsx",
        component: "select",
        code: `import { css, type Handle } from "remix/ui"
import * as select from "remix/ui/select/primitives"

function SelectValue(handle: Handle) {
  let value = handle.context.get(select.Context)
  return () => <span>{value.displayedLabel}</span>
}

<select.Context defaultLabel="Vinyl" defaultValue="vinyl" name="format">
  <button type="button" mix={[select.trigger(), css({/*...*/})]}>
    <SelectValue />
  </button>
  <div mix={[select.popover(), css({/*...*/})]}>
    <div mix={[select.list(), css({/*...*/})]}>
      <div mix={[select.option({ label: "Vinyl", value: "vinyl" }), css({/*...*/})]}>Vinyl</div>
      <div mix={[select.option({ label: "Digital", value: "digital" }), css({/*...*/})]}>Digital</div>
    </div>
  </div>
  <input mix={select.hiddenInput()} />
</select.Context>`,
      },
      {
        id: "tabs",
        label: "Tabs",
        title: "Connect tabs to their panels",
        body: "Use your own buttons and panel elements while Remix manages selection, keyboard activation, focus order, visibility, and the accessible relationships between them.",
        filename: "album-tabs.tsx",
        component: "tabs",
        code: `import { css } from "remix/ui"
import * as tabs from "remix/ui/tabs/primitives"

<tabs.Context defaultActiveTab="overview">
  <div mix={[tabs.root(), css({/*...*/})]}>
    <div aria-label="Album sections" mix={[tabs.list(), css({/*...*/})]}>
      <button mix={[tabs.tab({ name: "overview" }), css({/*...*/})]}>Overview</button>
      <button mix={[tabs.tab({ name: "tracks" }), css({/*...*/})]}>Tracks</button>
    </div>
    <div mix={[tabs.panel({ name: "overview" }), css({/*...*/})]}><AlbumOverview /></div>
    <div mix={[tabs.panel({ name: "tracks" }), css({/*...*/})]}><TrackList /></div>
  </div>
</tabs.Context>`,
      },
      {
        id: "accordion",
        label: "Accordion",
        title: "Connect triggers to collapsible regions",
        body: "Keep the headings, buttons, panels, and styles in application code. Remix coordinates expanded state, keyboard movement, generated IDs, inert panels, and ARIA relationships.",
        filename: "album-details.tsx",
        component: "accordion",
        code: `import { css } from "remix/ui"
import * as accordion from "remix/ui/accordion/primitives"

<accordion.Context defaultValue="credits">
  <div mix={[accordion.root(), css({/*...*/})]}>
    <accordion.ItemContext value="credits">
      <div mix={[accordion.item(), css({/*...*/})]}>
        <h3><button mix={[accordion.trigger(), css({/*...*/})]}>Credits</button></h3>
        <div mix={[accordion.content(), css({/*...*/})]}>Produced by Quincy Jones</div>
      </div>
    </accordion.ItemContext>
  </div>
</accordion.Context>`,
      },
      {
        id: "popovers",
        label: "Popovers",
        title: "Anchor and dismiss a floating surface",
        body: "Turn your own elements into an anchor and controlled surface. Remix handles placement, outside clicks, Escape, scroll locking, and focus restoration without prescribing the panel design.",
        filename: "track-inspector.tsx",
        component: "popovers",
        code: `import { css, on, type Handle } from "remix/ui"
import * as popover from "remix/ui/popover"

function TrackInspector(handle: Handle) {
  let open = false

  return () => (
    <popover.Context>
      <button
        mix={[css({/*...*/}), popover.anchor({ placement: "bottom-end" }), on("click", () => {
          open = true
          void handle.update()
        })]}
      >Track details</button>
      <aside mix={[css({/*...*/}), popover.surface({
        open,
        onHide() { open = false; void handle.update() },
      })]}>
        <TrackCredits />
      </aside>
    </popover.Context>
  )
}`,
      },
      {
        id: "toggle",
        label: "Toggle",
        title: "Add switch behavior to any control",
        body: "Apply normalized checked state, switch semantics, keyboard interaction, and change events to a native input or a custom host, then style the states with your own CSS.",
        filename: "release-visibility.tsx",
        component: "toggle",
        code: `import { css } from "remix/ui"
import * as toggle from "remix/ui/toggle/primitives"

<div mix={css({/*...*/})}>
  <span>Public release</span>
  <button
    aria-label="Public release"
    type="button"
    mix={[
      toggle.control({ defaultChecked: true }),
      css({/*...*/}),
    ]}
  />
</div>`,
      },
      {
        id: "listbox",
        label: "Listbox",
        title: "Wire keyboard selection to custom options",
        body: "Turn application-owned option markup into a controlled listbox with highlighting, selection, disabled items, typeahead, and focus scrolling.",
        filename: "genre-list.tsx",
        component: "listbox",
        code: `import { css } from "remix/ui"
import * as listbox from "remix/ui/listbox"

<listbox.Context
  value={genre} activeValue={activeGenre}
  onSelect={setGenre} onHighlight={setActiveGenre}
>
  <div aria-label="Genre" tabIndex={0} mix={[listbox.list(), css({/*...*/})]}>
    <div mix={[listbox.option({ label: "Pop", value: "pop" }), css({/*...*/})]}>Pop</div>
    <div mix={[listbox.option({ label: "R&B", value: "r-and-b" }), css({/*...*/})]}>R&amp;B</div>
  </div>
</listbox.Context>`,
      },
    ],
  },
  {
    id: "animation",
    label: "Animation",
    introTitle: "Add declarative motion to your interface",
    introBody:
      "Animate elements as they enter, exit, move, and resize with simple mixins. Configure CSS transitions with springs, or tween values directly in JavaScript for more advanced transitions.",
    examples: [
      {
        id: "presence",
        label: "Entrance and exit",
        title: "Animate element entrance and exit",
        body: "Define how conditional UI appears and disappears. Elements remain mounted until their transition completes.",
        filename: "presence.tsx",
        animation: "presence",
        code: `import {
  animateEntrance, animateExit, spring
} from "remix/ui/animation"

{showNotice && (
  <Notice
    key="notice"
    mix={[
      animateEntrance({
        opacity: 0,
        transform: "scale(.84)",
        ...spring("snappy"),
      }),
      animateExit({
        opacity: 0,
        transform: "scale(.84)",
        ...spring(),
      }),
    ]}
  />
)}`,
      },
      {
        id: "layout",
        label: "Layout",
        title: "Animate layouts",
        body: "Move, resize, or reorder keyed elements normally. Elements transition between layouts without manual measurements.",
        filename: "cards.tsx",
        animation: "layout",
        code: `import {
  animateLayout, spring
} from "remix/ui/animation"

{items.map((item) => (
  <Card
    key={item.id}
    mix={animateLayout({
      size: false,
      ...spring("bouncy"),
    })}
  />
))}`,
      },
      {
        id: "spring",
        label: "Spring",
        title: "Add spring transitions",
        body: "Turn spring settings into CSS transition timing with natural acceleration and bounce.",
        filename: "shape.tsx",
        animation: "spring",
        code: `import { spring } from "remix/ui/animation"

<div
  style={{
    width: expanded ? 176 : 84,
    height: expanded ? 72 : 84,
    borderRadius: expanded ? 22 : "50%",
    transition: spring.transition(
      ["width", "height", "border-radius"],
      { duration: 600, bounce: 0.55 },
    ),
  }}
/>`,
      },
      {
        id: "tween",
        label: "Tween",
        title: "Tween any value",
        body: "Generate interpolated values over time, then use them in your own rendering code.",
        filename: "meter.tsx",
        animation: "tween",
        code: `import { type Handle } from "remix/ui"
import { easings, tween } from "remix/ui/animation"

function Percentage(handle: Handle) {
  let percentage = 0

  handle.queueTask(() => {
    let animation = tween({
      from: 0,
      to: 100,
      duration: 650,
      curve: easings.easeInOut,
    })
    animation.next()

    function tick(time: number) {
      let result = animation.next(time)
      percentage = result.value
      handle.update()

      if (!result.done) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  })

  return () => <output>
    {Math.round(percentage)}%
  </output>
}`,
      },
    ],
  },
] as const satisfies readonly StackCategory[];

export const stackExplorerCodeSamples = stackCategories.flatMap((category) =>
  category.examples.map((example) => ({
    key: `${category.id}/${example.id}`,
    code: example.code,
    language:
      "filename" in example && example.filename.endsWith(".css")
        ? "css"
        : "tsx",
  })),
);
