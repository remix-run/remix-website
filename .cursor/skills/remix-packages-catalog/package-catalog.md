# Remix package catalog

Use this as a quick chooser. Import from `remix/<package-name>` in app code.

## Core framework and UI

- `remix/component` - Component runtime for server render + selective hydration.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/component/README.md
- `remix/interaction` - Event system used by component interactivity.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/interaction/README.md
- `remix/response` - Fetch `Response` helpers.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/response/README.md
- `remix/html-template` - HTML template tag with escaping.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/html-template/README.md
- `remix/headers` - HTTP header helpers/utilities.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/headers/README.md

## Routing and servers

- `remix/fetch-router` - Fetch-native router with route mapping/controller APIs.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/fetch-router/README.md
- `remix/route-pattern` - Typed URL matching and URL generation.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/route-pattern/README.md
- `remix/node-fetch-server` - Node server adapters around Fetch APIs.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/node-fetch-server/README.md
- `remix/fetch-proxy` - Proxy requests/responses with Fetch primitives.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/fetch-proxy/README.md

## Middleware

- `remix/async-context-middleware` - Request-scoped AsyncLocalStorage context.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/async-context-middleware/README.md
- `remix/compression-middleware` - Response compression middleware.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/compression-middleware/README.md
- `remix/form-data-middleware` - Parse `FormData` into request context.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/form-data-middleware/README.md
- `remix/logger-middleware` - Request/response logging middleware.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/logger-middleware/README.md
- `remix/method-override-middleware` - Form-driven HTTP method override.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/method-override-middleware/README.md
- `remix/session-middleware` - Session loading/saving middleware.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/session-middleware/README.md
- `remix/static-middleware` - Static file serving middleware.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/static-middleware/README.md

## Forms, uploads, files, MIME

- `remix/form-data-parser` - Streaming `request.formData()` replacement for uploads.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/form-data-parser/README.md
- `remix/multipart-parser` - Multipart stream parser primitive.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/multipart-parser/README.md
- `remix/file-storage` - Key/value storage for `File` objects.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/file-storage/README.md
- `remix/fs` - File-system helpers based on Web File APIs.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/fs/README.md
- `remix/lazy-file` - Lazy streaming file abstraction.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/lazy-file/README.md
- `remix/mime` - MIME type utilities.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/mime/README.md
- `remix/tar-parser` - TAR stream parsing.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/tar-parser/README.md

## Sessions, cookies, and state

- `remix/cookie` - Cookie parsing/serialization helpers.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/cookie/README.md
- `remix/session` - Session primitives and storage interfaces.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/session/README.md

## Data and validation

- `remix/data-schema` - Standards-aligned schema validation and coercion.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/data-schema/README.md
- `remix/data-table` - Typed relational data toolkit.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/data-table/README.md
- `remix/data-table-mysql` - MySQL adapter for `data-table`.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/data-table-mysql/README.md
- `remix/data-table-postgres` - PostgreSQL adapter for `data-table`.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/data-table-postgres/README.md
- `remix/data-table-sqlite` - SQLite adapter for `data-table`.  
  README: https://raw.githubusercontent.com/remix-run/remix/refs/heads/main/packages/data-table-sqlite/README.md

## Umbrella package note

- `remix` - umbrella package that re-exports subpath APIs. Prefer subpath imports (for example `remix/component`, not `remix` root imports).
