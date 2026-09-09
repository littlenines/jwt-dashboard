# Conventions

[← index](./README.md)

## TypeScript config (`tsconfig.json`)

| Option                     | Effect / why it matters |
|----------------------------|-------------------------|
| `moduleResolution: bundler`| import `.ts` files without extensions |
| `erasableSyntaxOnly: true` | **no** TS syntax that emits runtime code. No `enum`, no `namespace` with values, no `constructor(private x)` parameter properties. Use plain fields + assignments. `tsx` enforces this. |
| `verbatimModuleSyntax: true`| type‑only imports **must** say so: `import { type Foo }` or `import type { Foo }`. Otherwise the import isn't erased and can cause runtime "not exported" errors. |
| `noEmit: true`             | tsc only type‑checks; `tsx` does the actual running |
| `strict: true`             | full strictness |

### Subpath imports

Defined in **both** `package.json` `"imports"` (for the runtime) and `tsconfig.json` `"paths"`
(for the type‑checker):

| Alias           | Resolves to        |
|-----------------|--------------------|
| `#lib/*`        | `./src/lib/*`      |
| `#features/*`   | `./src/features/*` |
| `#generated/*`  | `./generated/*`    |

Relative imports (`./auth.service`) are used *within* a feature folder; `#lib/...` for shared code.

---

## Environment variables (`.env`)

| Variable       | Used by                    | Purpose |
|----------------|----------------------------|---------|
| `APP_ENV`      | `src/lib/env.ts`           | `"production"` turns on `Secure` cookies. Anything else = development. |
| `PORT`         | `src/app.ts`              | HTTP port. Optional — defaults to `3000`. |
| `DATABASE_URL` | `prisma.config.ts`, `src/lib/prisma.ts` | Postgres connection string. Credentials must match `docker-compose.yml`. |
| `JWT_SECRET`   | `src/lib/jwt.ts`           | HMAC key for **access** tokens |
| `JWT_REFRESH`  | `src/lib/jwt.ts`           | HMAC key for **refresh** tokens (separate key = a leaked access secret can't forge refresh tokens) |

### Env loading order

`app.ts`'s **first line** is `import "dotenv/config";` — before any other import. This matters:
ES modules evaluate all imports (depth‑first) *before* the importing file's body runs, so a
plain `dotenv.config()` call lower in `app.ts` would execute **after** `./routes` (and its
whole `#lib/*` tree) has already been evaluated.

For the same reason, `#lib/jwt.ts` reads its secrets **lazily** —
`() => encoder.encode(process.env.JWT_SECRET)` inside each function, not
`const secret = ...encode(process.env.JWT_SECRET)` at module scope. A module‑scope read would
capture `undefined` if the module loaded before `.env`, and `jose` then throws
"Zero‑length key" on the first `sign`.

`prisma.config.ts` also does `import "dotenv/config"` (the Prisma CLI loads it separately).
