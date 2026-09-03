# `src/lib/` — shared primitives

[← index](./README.md)

App‑agnostic building blocks. They know nothing about "auth" — they sign a JWT, hash a string,
talk to the DB. Feature policy lives in [auth.md](./auth.md), not here.

## `prisma.ts`

Builds one `PrismaClient` over a `PrismaPg` driver adapter (`DATABASE_URL`) and exports it as a
singleton. Import `{ prisma }` everywhere — never `new PrismaClient()` again (connection‑pool
exhaustion).

## `jwt.ts`

HS256 JWTs via `jose`. Two independent keys. Lifetimes come from `#lib/tokenPolicy`.

| Function             | Key            | `exp` | Claim |
|----------------------|----------------|-------|-------|
| `signToken`          | `JWT_SECRET`   | `ACCESS_TOKEN.jwtExpiration` (15 min) | `{ sub: userId }` |
| `verifyToken`        | `JWT_SECRET`   | —     | returns `{ sub }` (throws if invalid) |
| `signRefreshToken`   | `JWT_REFRESH`  | `REFRESH_TOKEN.jwtExpiration` (60 d)  | `{ sub: userId }` |
| `verifyRefreshToken` | `JWT_REFRESH`  | —     | returns `{ sub }` (throws if invalid) |

`verifyToken` (access) has no caller yet — it's for a future "require auth" middleware on
protected routes.

## `crypto.ts`

`hashToken(token) = sha256 hex`. Used to store/look up refresh tokens **without** keeping the
raw value. sha256 (not argon2) is correct here: the input is already a high‑entropy random
JWT, so it doesn't need a slow hash, and lookups must be fast.

## `tokenPolicy.ts`

Single source of truth for **every** token duration.

| Export | Value | Consumed by |
|--------|-------|-------------|
| `ACCESS_TOKEN.jwtExpiration` | `"15min"` | `jwt.ts` → JWT `exp` |
| `ACCESS_TOKEN.maxAgeMs` | `900_000` | `auth.cookies.ts` → access cookie `maxAge` |
| `REFRESH_TOKEN.jwtExpiration` | `"60d"` | `jwt.ts` → JWT `exp` |
| `getRefreshTokenLifetime(remember)` | `{ maxAge, expiresAt }` — 60 d if `remember` else 1 d | `auth.tokens.ts` → refresh cookie `maxAge` + `RefreshToken.expiresAt` |

The refresh **JWT** is signed with the longest window (60 d); the real per‑session gate is the
`RefreshToken.expiresAt` row, which `refreshService` checks on every call. So a non‑remember
session is dead after 1 day even though its JWT would still verify.

## `env.ts`

`isProduction = process.env.APP_ENV === "production"`. Cross‑cutting, so it's in `lib/` rather
than the auth feature.

---

> `src/middleware/validate.ts` and `src/middleware/errorHandler.ts` are also generic, but they
> are HTTP‑request infrastructure — documented in [request-flow.md](./request-flow.md).
