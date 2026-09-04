# Backend Documentation

A small Express + JWT authentication API. These docs explain **every file, function, and
decision** in the backend so the codebase can be understood without reading all the source.

> The React client is documented in [../frontend/](../frontend/README.md).

## Index

| Doc | Covers |
|-----|--------|
| [conventions.md](./conventions.md) | TypeScript config, subpath imports, environment variables |
| [data-model.md](./data-model.md)   | Prisma schema — `User`, `RefreshToken` |
| [request-flow.md](./request-flow.md) | `app.ts` middleware chain, routing, `validate` + `errorHandler` middleware |
| [auth.md](./auth.md)               | The `auth` feature file‑by‑file, and how the token model works |
| [lib.md](./lib.md)                 | `src/lib/` shared primitives |
| [api.md](./api.md)                 | Endpoint reference + the security rationale |
| [todo.md](./todo.md)              | Known gaps / hardening backlog |

---

## Stack

| Concern            | Choice                     | Notes |
|--------------------|----------------------------|-------|
| Runtime            | Node (ESM, `"type": "module"`) | run through `tsx`, no build step |
| Language           | TypeScript 7, `strict`     | type‑stripped at runtime, never compiled to JS |
| HTTP framework     | Express 5                  | async route handlers can throw; errors propagate automatically |
| Database           | PostgreSQL 17              | local instance via `docker-compose.yml` |
| ORM                | Prisma 7 (`prisma-client` generator) | client generated into `generated/prisma/` |
| DB driver          | `@prisma/adapter-pg` + `pg` | Prisma 7 uses a driver adapter instead of its own engine |
| Password hashing   | `argon2`                   | memory‑hard, current best practice |
| JWT                | `jose`                     | `SignJWT` / `jwtVerify`, HS256 |
| Validation         | `zod` 4                    | request‑body schemas |
| Security headers   | `helmet`                   | |
| Cookie parsing     | `cookie-parser`            | reads the auth cookies off requests |

### Scripts (`package.json`)

| Script                | Command                     | Purpose |
|-----------------------|-----------------------------|---------|
| `pnpm dev`            | `tsx watch src/app.ts`      | backend with hot reload |
| `pnpm dev:frontend`   | `pnpm --dir frontend dev`   | frontend dev server |
| `pnpm dev:all`        | `concurrently ...`          | both at once |
| `pnpm start`          | `tsx src/app.ts`            | backend once, no watch |
| `pnpm prisma:generate`| `prisma generate`           | regenerate the client after a schema change |
| `pnpm prisma:migrate` | `prisma migrate dev`        | create + apply a migration in dev |
| `pnpm prisma:studio`  | `prisma studio`             | DB browser GUI |

---

## Project layout

```
src/
  app.ts                      app entrypoint: middleware chain + server start
  routes.ts                   top-level router, mounts feature routers under prefixes

  lib/                        app-agnostic primitives (no domain knowledge)
    prisma.ts                 configured PrismaClient singleton
    jwt.ts                    sign / verify access + refresh JWTs
    crypto.ts                 sha256 hashing (for refresh tokens at rest)
    tokenPolicy.ts            single source of truth for all token lifetimes
    env.ts                    parsed environment flags

  middleware/
    validate.ts               generic "validate req.body against a zod schema" middleware
    errorHandler.ts           central Express error handler (last in the chain)

  features/
    auth/                     the auth feature (one folder, one concern)
      auth.route.ts           routes for /auth/*  (path -> middleware -> controller)
      auth.controller.ts      HTTP layer: read req, call service, map result to a response
      auth.service.ts         business logic: what a DB result *means*, no raw queries
      auth.repository.ts      every raw Prisma call for this feature, no business logic
      auth.tokens.ts          issueTokens(): mint an access+refresh pair
      auth.cookies.ts         set / clear the auth cookies (cookie config lives here)
      auth.validate.ts        zod schemas for login / register bodies
      auth.types.ts           shared TypeScript types for the feature

prisma/
  schema.prisma               data model
  migrations/                 SQL migration history

generated/prisma/             Prisma client (generated, do not edit, gitignored ideally)
docker-compose.yml            local Postgres
prisma.config.ts              Prisma CLI config (schema path, migrations path, datasource URL)
tsconfig.json                 see conventions.md
```

### The layering rule

```
route  ->  controller  ->  service  ->  repository  ->  lib/prisma
                    \-> cookies -> lib/env
   everything -> types  (types imports nothing)
```

- **lib/** = *mechanism*. Generic, reusable, knows nothing about auth. (`sign a JWT`, `hash a string`.)
- **repository** = *raw data access*. One function per query, named for what it fetches/writes.
  No business logic, no interpretation of the result.
- **feature service** = *policy*. Your app's rules, and what a repository result *means*.
  (`a login mints two tokens`, `an email must be unique`, `a unique-constraint error means this
  email is taken`.)
- **controller** = *HTTP adapter*. Translates between HTTP and the service. Owns status codes,
  cookies, and response shapes. Holds **no** business logic and **no** database access.
- A controller is allowed to be more than one line — it needs to map different service outcomes
  (`null`, a conflict object, a thrown error) to different status codes.
