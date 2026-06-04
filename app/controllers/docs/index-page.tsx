import type { Handle, RemixNode } from "remix/ui";

import { routes } from "../../routes.ts";
import type { AppContext } from "../../middleware/render.ts";
import type { DocsPageProps } from "./shared.tsx";
import { DocsDocument, docsResponseInit } from "./shared.tsx";

export async function docsIndexHandler({ render, request }: AppContext) {
  return render(<DocsIndexPage requestUrl={request.url} />, docsResponseInit);
}

function DocsIndexPage(handle: Handle<DocsPageProps>) {
  return () => (
    <DocsDocument
      requestUrl={handle.props.requestUrl}
      title="Remix Docs"
      description="Guides, explanations, examples, and tutorials for learning Remix."
    >
      <div class="container my-12 flex max-w-full flex-col gap-12 lg:max-w-5xl">
        <header class="flex max-w-3xl flex-col gap-5">
          <p class="rmx-page-body rmx-page-body-sm font-semibold uppercase text-red-brand">
            Remix Docs
          </p>
          <h1 class="rmx-page-title dark:text-gray-200">
            Learn Remix from the request up.
          </h1>
          <p class="rmx-page-body">
            These guide chapters introduce Remix at a high level, then
            progressively deepen into routing, rendering, interactivity, data,
            security, assets, testing, production, examples, and tutorials.
          </p>
          <p class="rmx-page-body">
            API reference lives separately at{" "}
            <a
              href="https://api.remix.run"
              class="text-blue-700 underline dark:text-blue-500"
            >
              api.remix.run
            </a>
            .
          </p>
        </header>

        <ol class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <ChapterCard
            chapter="Chapter 1"
            title="Start Here"
            href={routes.docs.startHere.href()}
            description="A high-level introduction to Remix and the mental model behind a Remix application."
          >
            <li>
              <a
                href={routes.docs.startHere.href() + "#what-is-remix"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                What is Remix?
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.startHere.href() +
                  "#quickstart-create-and-run-a-remix-app"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Quickstart: create and run a Remix app
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.startHere.href() +
                  "#project-tour-server-ts-app-routes-ts-app-router-ts-controllers-ui-assets"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Project tour: server.ts, app/routes.ts, app/router.ts,
                controllers, UI, assets
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.startHere.href() +
                  "#the-core-model-request-middleware-router-controller-response"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                The core model: Request, middleware, router, controller,
                Response
              </a>
            </li>
            <li>
              <a
                href={routes.docs.startHere.href() + "#build-your-first-page"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build your first page
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.startHere.href() + "#build-your-first-form-action"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build your first form action
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.startHere.href() +
                  "#add-your-first-hydrated-component"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Add your first hydrated component
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 2"
            title="Core App Structure"
            href={routes.docs.coreAppStructure.href()}
            description="The files, ownership boundaries, and route conventions that shape a Remix app."
          >
            <li>
              <a
                href={
                  routes.docs.coreAppStructure.href() +
                  "#routes-as-the-url-contract"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Routes as the URL contract
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.coreAppStructure.href() +
                  "#route-builders-route-get-post-put-del-form-resources"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Route builders: route, get, post, put, del, form, resources
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.coreAppStructure.href() +
                  "#controllers-and-actions"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Controllers and actions
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.coreAppStructure.href() +
                  "#nested-route-maps-and-ownership"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Nested route maps and ownership
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.coreAppStructure.href() +
                  "#responses-redirects-headers-and-errors"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Responses, redirects, headers, and errors
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.coreAppStructure.href() +
                  "#app-organization-patterns"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                App organization patterns
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 3"
            title="Server Runtime"
            href={routes.docs.serverRuntime.href()}
            description="How Remix bridges Web API request handling into a Node server and middleware stack."
          >
            <li>
              <a
                href={
                  routes.docs.serverRuntime.href() + "#the-node-server-entry"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                The Node server entry
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.serverRuntime.href() + "#createrequestlistener"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                createRequestListener
              </a>
            </li>
            <li>
              <a
                href={routes.docs.serverRuntime.href() + "#middleware-ordering"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Middleware ordering
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.serverRuntime.href() + "#typed-request-context"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Typed request context
              </a>
            </li>
            <li>
              <a
                href={routes.docs.serverRuntime.href() + "#static-files"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Static files
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.serverRuntime.href() +
                  "#compression-logging-method-override"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Compression, logging, method override
              </a>
            </li>
            <li>
              <a
                href={routes.docs.serverRuntime.href() + "#cors-cop-and-csrf"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                CORS, COP, and CSRF
              </a>
            </li>
            <li>
              <a
                href={routes.docs.serverRuntime.href() + "#custom-middleware"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Custom middleware
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 4"
            title="Rendering UI"
            href={routes.docs.renderingUi.href()}
            description="How Remix components render on the server, collect styles, and form the document shell."
          >
            <li>
              <a
                href={
                  routes.docs.renderingUi.href() + "#the-remix-component-model"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                The Remix component model
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.renderingUi.href() +
                  "#handle-props-setup-render-and-updates"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Handle, props, setup, render, and updates
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.renderingUi.href() +
                  "#server-rendering-with-rendertostream-and-rendertostring"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Server rendering with renderToStream and renderToString
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.renderingUi.href() +
                  "#document-shells-and-head-content"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Document shells and head content
              </a>
            </li>
            <li>
              <a
                href={routes.docs.renderingUi.href() + "#styling-with-css"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Styling with css
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.renderingUi.href() +
                  "#theme-tokens-and-createtheme"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Theme tokens and createTheme
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.renderingUi.href() +
                  "#first-party-ui-components-buttons-menus-popovers-listboxes-selects-comboboxes"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                First-party UI components: buttons, menus, popovers, listboxes,
                selects, comboboxes
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 5"
            title="Interactivity"
            href={routes.docs.interactivity.href()}
            description="How browser behavior layers onto server-rendered Remix UI without replacing the server path."
          >
            <li>
              <a
                href={
                  routes.docs.interactivity.href() + "#progressive-enhancement"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Progressive enhancement
              </a>
            </li>
            <li>
              <a
                href={routes.docs.interactivity.href() + "#cliententry"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                clientEntry
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.interactivity.href() + "#browser-entry-with-run"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Browser entry with run
              </a>
            </li>
            <li>
              <a
                href={routes.docs.interactivity.href() + "#events-with-on"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Events with on
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.interactivity.href() +
                  "#refs-attrs-and-dom-lifecycle"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Refs, attrs, and DOM lifecycle
              </a>
            </li>
            <li>
              <a
                href={routes.docs.interactivity.href() + "#the-mix-prop"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                The mix prop
              </a>
            </li>
            <li>
              <a
                href={routes.docs.interactivity.href() + "#built-in-mixins"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Built-in mixins
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.interactivity.href() + "#creating-custom-mixins"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Creating custom mixins
              </a>
            </li>
            <li>
              <a
                href={routes.docs.interactivity.href() + "#client-navigation"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Client navigation
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.interactivity.href() +
                  "#frames-and-partial-server-rendered-ui"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Frames and partial server-rendered UI
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.interactivity.href() +
                  "#coordinating-forms-fetches-frame-reloads-and-navigation"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Coordinating forms, fetches, frame reloads, and navigation
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 6"
            title="Animation"
            href={routes.docs.animation.href()}
            description="The CSS-first animation model and Remix UI helpers for motion that respects rendering state."
          >
            <li>
              <a
                href={routes.docs.animation.href() + "#css-first-visual-states"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                CSS-first visual states
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.animation.href() + "#entrance-and-exit-animations"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Entrance and exit animations
              </a>
            </li>
            <li>
              <a
                href={routes.docs.animation.href() + "#layout-animations"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Layout animations
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.animation.href() + "#springs-tweens-and-easing"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Springs, tweens, and easing
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.animation.href() + "#interruptible-interactions"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Interruptible interactions
              </a>
            </li>
            <li>
              <a
                href={routes.docs.animation.href() + "#reduced-motion-behavior"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Reduced-motion behavior
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 7"
            title="Data and Validation"
            href={routes.docs.dataAndValidation.href()}
            description="How Remix validates trust boundaries and carries typed values into persistence."
          >
            <li>
              <a
                href={
                  routes.docs.dataAndValidation.href() +
                  "#validating-trust-boundaries"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Validating trust boundaries
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.dataAndValidation.href() + "#remix-data-schema"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                remix/data-schema
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.dataAndValidation.href() +
                  "#form-parsing-with-remix-data-schema-form-data"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Form parsing with remix/data-schema/form-data
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.dataAndValidation.href() + "#coercion-and-checks"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Coercion and checks
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.dataAndValidation.href() +
                  "#tables-with-remix-data-table"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Tables with remix/data-table
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.dataAndValidation.href() +
                  "#queries-and-crud-helpers"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Queries and CRUD helpers
              </a>
            </li>
            <li>
              <a
                href={routes.docs.dataAndValidation.href() + "#transactions"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Transactions
              </a>
            </li>
            <li>
              <a
                href={routes.docs.dataAndValidation.href() + "#migrations"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Migrations
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.dataAndValidation.href() +
                  "#sqlite-postgres-and-mysql-adapters"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                SQLite, Postgres, and MySQL adapters
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.dataAndValidation.href() +
                  "#request-scoped-database-access"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Request-scoped database access
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 8"
            title="Forms and Mutations"
            href={routes.docs.formsAndMutations.href()}
            description="How forms, actions, redirects, validation errors, and resource endpoints fit together."
          >
            <li>
              <a
                href={
                  routes.docs.formsAndMutations.href() +
                  "#html-first-form-workflows"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                HTML-first form workflows
              </a>
            </li>
            <li>
              <a
                href={routes.docs.formsAndMutations.href() + "#form-routes"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Form routes
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.formsAndMutations.href() + "#post-redirect-get"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                POST-redirect-GET
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.formsAndMutations.href() + "#validation-failures"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Validation failures
              </a>
            </li>
            <li>
              <a
                href={routes.docs.formsAndMutations.href() + "#optimistic-ui"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Optimistic UI
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.formsAndMutations.href() +
                  "#resource-routes-and-json-endpoints"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Resource routes and JSON endpoints
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.formsAndMutations.href() +
                  "#method-override-for-put-patch-and-delete"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Method override for PUT, PATCH, and DELETE
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 9"
            title="Auth, Sessions, and Security"
            href={routes.docs.authSessionsSecurity.href()}
            description="The Remix model for per-browser state, identity, authorization, and browser request safety."
          >
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() +
                  "#cookies-vs-sessions"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Cookies vs sessions
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() +
                  "#session-storage-strategies"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Session storage strategies
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() + "#login-and-logout"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Login and logout
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() + "#flash-messages"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Flash messages
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() +
                  "#regenerating-session-ids"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Regenerating session IDs
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() + "#credentials-auth"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Credentials auth
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() +
                  "#oauth-and-oidc-providers"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                OAuth and OIDC providers
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() +
                  "#route-protection-with-requireauth"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Route protection with requireAuth
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() +
                  "#authorization-checks"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Authorization checks
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() + "#csrf-protection"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                CSRF protection
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.authSessionsSecurity.href() +
                  "#cross-origin-protection"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Cross-origin protection
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 10"
            title="Files and Assets"
            href={routes.docs.filesAndAssets.href()}
            description="How Remix serves static files, browser modules, uploads, downloads, and source assets."
          >
            <li>
              <a
                href={
                  routes.docs.filesAndAssets.href() +
                  "#static-files-vs-source-served-assets"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Static files vs source-served assets
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.filesAndAssets.href() +
                  "#remix-s-unbundled-asset-server"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Remix's unbundled asset server
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.filesAndAssets.href() +
                  "#file-maps-allow-and-deny-rules-and-browser-only-modules"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                File maps, allow and deny rules, and browser-only modules
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.filesAndAssets.href() +
                  "#client-entry-hrefs-and-module-preloads"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Client entry hrefs and module preloads
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.filesAndAssets.href() +
                  "#fingerprinting-source-maps-minification"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Fingerprinting, source maps, minification
              </a>
            </li>
            <li>
              <a
                href={routes.docs.filesAndAssets.href() + "#file-uploads"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                File uploads
              </a>
            </li>
            <li>
              <a
                href={routes.docs.filesAndAssets.href() + "#multipart-parsing"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Multipart parsing
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.filesAndAssets.href() +
                  "#file-storage-memory-filesystem-s3"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                File storage: memory, filesystem, S3
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.filesAndAssets.href() +
                  "#file-downloads-lazy-files-mime-types-and-range-responses"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                File downloads, lazy files, MIME types, and range responses
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 11"
            title="Testing"
            href={routes.docs.testing.href()}
            description="How to test Remix apps at the router, component, browser, middleware, and CI layers."
          >
            <li>
              <a
                href={routes.docs.testing.href() + "#testing-philosophy"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Testing philosophy
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.testing.href() + "#router-tests-with-router-fetch"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Router tests with router.fetch
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.testing.href() +
                  "#component-tests-with-remix-ui-test"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Component tests with remix/ui/test
              </a>
            </li>
            <li>
              <a
                href={routes.docs.testing.href() + "#browser-and-e2e-tests"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Browser and E2E tests
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.testing.href() +
                  "#session-and-database-test-isolation"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Session and database test isolation
              </a>
            </li>
            <li>
              <a
                href={routes.docs.testing.href() + "#testing-middleware"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Testing middleware
              </a>
            </li>
            <li>
              <a
                href={routes.docs.testing.href() + "#testing-uploads"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Testing uploads
              </a>
            </li>
            <li>
              <a
                href={routes.docs.testing.href() + "#coverage-and-ci-patterns"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Coverage and CI patterns
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 12"
            title="CLI and Tooling"
            href={routes.docs.cliAndTooling.href()}
            description="The Remix command-line workflow for creating, inspecting, testing, and checking projects."
          >
            <li>
              <a
                href={routes.docs.cliAndTooling.href() + "#remix-new"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                remix new
              </a>
            </li>
            <li>
              <a
                href={routes.docs.cliAndTooling.href() + "#remix-routes"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                remix routes
              </a>
            </li>
            <li>
              <a
                href={routes.docs.cliAndTooling.href() + "#remix-doctor"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                remix doctor
              </a>
            </li>
            <li>
              <a
                href={routes.docs.cliAndTooling.href() + "#remix-doctor-fix"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                remix doctor --fix
              </a>
            </li>
            <li>
              <a
                href={routes.docs.cliAndTooling.href() + "#remix-test"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                remix test
              </a>
            </li>
            <li>
              <a
                href={routes.docs.cliAndTooling.href() + "#remix-version"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                remix version
              </a>
            </li>
            <li>
              <a
                href={routes.docs.cliAndTooling.href() + "#shell-completion"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Shell completion
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.cliAndTooling.href() + "#typescript-and-jsx-setup"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                TypeScript and JSX setup
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.cliAndTooling.href() + "#using-remix-node-tsx"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Using remix/node-tsx
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 13"
            title="Production"
            href={routes.docs.production.href()}
            description="Operational concerns for running Remix applications outside the development loop."
          >
            <li>
              <a
                href={
                  routes.docs.production.href() +
                  "#environment-variables-and-secrets"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Environment variables and secrets
              </a>
            </li>
            <li>
              <a
                href={routes.docs.production.href() + "#startup-and-shutdown"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Startup and shutdown
              </a>
            </li>
            <li>
              <a
                href={routes.docs.production.href() + "#caching"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Caching
              </a>
            </li>
            <li>
              <a
                href={routes.docs.production.href() + "#streaming-and-aborts"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Streaming and aborts
              </a>
            </li>
            <li>
              <a
                href={routes.docs.production.href() + "#error-handling"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Error handling
              </a>
            </li>
            <li>
              <a
                href={routes.docs.production.href() + "#deployment-checklist"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Deployment checklist
              </a>
            </li>
            <li>
              <a
                href={routes.docs.production.href() + "#observability-hooks"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Observability hooks
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 14"
            title="Advanced Guides"
            href={routes.docs.advancedGuides.href()}
            description="Deeper patterns for extending Remix, integrating services, and building specialized systems."
          >
            <li>
              <a
                href={
                  routes.docs.advancedGuides.href() +
                  "#building-custom-ui-primitives"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Building custom UI primitives
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.advancedGuides.href() +
                  "#building-reusable-mixin-libraries"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Building reusable mixin libraries
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.advancedGuides.href() +
                  "#low-level-route-patterns"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Low-level route patterns
              </a>
            </li>
            <li>
              <a
                href={routes.docs.advancedGuides.href() + "#fetch-proxying"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Fetch proxying
              </a>
            </li>
            <li>
              <a
                href={routes.docs.advancedGuides.href() + "#server-sent-events"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Server-sent events
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.advancedGuides.href() +
                  "#tar-parsing-and-package-browser-style-apps"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Tar parsing and package-browser style apps
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.advancedGuides.href() +
                  "#building-clis-with-remix-packages"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Building CLIs with Remix packages
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.advancedGuides.href() +
                  "#integrating-external-services"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Integrating external services
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 15"
            title="Example Apps"
            href={routes.docs.exampleApps.href()}
            description="Guided tours through complete Remix demos and the framework concepts each one demonstrates."
          >
            <li>
              <a
                href={
                  routes.docs.exampleApps.href() +
                  "#bookstore-full-stack-commerce-app"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Bookstore: full-stack commerce app
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.exampleApps.href() +
                  "#social-auth-credentials-plus-oauth-oidc"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Social Auth: credentials plus OAuth/OIDC
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.exampleApps.href() + "#frames-partial-server-ui"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Frames: partial server UI
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.exampleApps.href() +
                  "#frame-navigation-app-shell-navigation"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Frame Navigation: app-shell navigation
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.exampleApps.href() +
                  "#assets-source-served-browser-modules"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Assets: source-served browser modules
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.exampleApps.href() +
                  "#timeboxer-auth-csrf-json-endpoints-calendar-export"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Timeboxer: auth, CSRF, JSON endpoints, calendar export
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.exampleApps.href() +
                  "#unpkg-clone-tar-parsing-file-responses-package-browsing"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                UNPKG clone: tar parsing, file responses, package browsing
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.exampleApps.href() +
                  "#sse-streaming-server-events"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                SSE: streaming server events
              </a>
            </li>
          </ChapterCard>
          <ChapterCard
            chapter="Chapter 16"
            title="Tutorials"
            href={routes.docs.tutorials.href()}
            description="Complete walkthroughs that turn the guide chapters into working Remix applications."
          >
            <li>
              <a
                href={
                  routes.docs.tutorials.href() + "#build-your-first-remix-app"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build your first Remix app
              </a>
            </li>
            <li>
              <a
                href={routes.docs.tutorials.href() + "#build-a-contact-form"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build a contact form
              </a>
            </li>
            <li>
              <a
                href={routes.docs.tutorials.href() + "#build-a-crud-resource"}
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build a CRUD resource
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.tutorials.href() + "#build-authenticated-routes"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build authenticated routes
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.tutorials.href() + "#build-a-file-upload-flow"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build a file upload flow
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.tutorials.href() +
                  "#build-a-progressively-enhanced-cart"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build a progressively enhanced cart
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.tutorials.href() +
                  "#build-a-frame-powered-dashboard"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build a frame-powered dashboard
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.tutorials.href() +
                  "#build-a-data-backed-admin-area"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build a data-backed admin area
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.tutorials.href() +
                  "#build-and-test-a-production-feature"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build and test a production feature
              </a>
            </li>
            <li>
              <a
                href={
                  routes.docs.tutorials.href() +
                  "#build-a-small-app-from-scratch"
                }
                class="text-sm text-blue-700 underline dark:text-blue-500"
              >
                Build a small app from scratch
              </a>
            </li>
          </ChapterCard>
        </ol>
      </div>
    </DocsDocument>
  );
}

function ChapterCard(
  handle: Handle<{
    chapter: string;
    title: string;
    href: string;
    description: string;
    children: RemixNode;
  }>,
) {
  return () => (
    <li class="rounded border border-gray-200 p-5 dark:border-gray-800">
      <div class="mb-2 font-mono text-sm text-gray-500">
        {handle.props.chapter}
      </div>
      <h2 class="rmx-page-title rmx-page-title-xs mb-3 dark:text-gray-200">
        <a href={handle.props.href} class="hover:text-red-brand">
          {handle.props.title}
        </a>
      </h2>
      <p class="rmx-page-body rmx-page-body-sm mb-4">
        {handle.props.description}
      </p>
      <ul class="flex flex-col gap-2">{handle.props.children}</ul>
    </li>
  );
}
