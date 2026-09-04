# The `auth` feature

[← index](./README.md) · see also [api.md](./api.md) for the endpoint reference and
[request-flow.md](./request-flow.md) for the generic `validate` / `errorHandler` middleware.

Files: `src/features/auth/` — `auth.route.ts`, `auth.controller.ts`, `auth.service.ts`,
`auth.repository.ts`, `auth.tokens.ts`, `auth.cookies.ts`, `auth.validate.ts`, `auth.types.ts`.

---

## `auth.validate.ts` — request‑body schemas

`loginSchema`

| Field      | Rule                                    | Why |
|------------|-----------------------------------------|-----|
| `email`    | `z.email().toLowerCase().trim()`        | valid format; normalized so lookup matches how it was stored |
| `password` | `z.string().min(1)`                     | non‑empty only — login must **not** advertise the password policy |
| `remember` | `z.boolean().optional().default(false)` | optional; missing = `false`, so the controller always gets a real boolean |

`registerSchema`

| Field            | Rule                       | Why |
|------------------|----------------------------|-----|
| `email`          | `z.email().toLowerCase().trim()` | same as login |
| `username`       | `z.string().trim().min(3).max(30)` | length bounds |
| `password`       | `z.string().min(8).max(128)` | policy enforced **here** (registration is where rules live) |
| `confirmPassword`| `z.string()`               | compared below |
| `accept`         | `z.literal(true)`          | must be exactly `true`; replaces a manual `if (!accept)` check |
| *(object)*       | `.refine(password === confirmPassword)` | cross‑field check; error attributed to `confirmPassword` |

What zod **cannot** do here: check that the email/username are unique. That needs the DB and
lives in `registerService`.

---

## `auth.controller.ts` — HTTP layer

Shared helpers imported from `auth.cookies.ts`: `setAuthCookies`, `clearAuthCookies`.

Every controller has the same shape: **read input → call one service → map the *expected*
outcomes to a response.** There is **no `try/catch`** — an unexpected throw (or a rejected
async call) propagates to the central `errorHandler` (see [request-flow.md](./request-flow.md#4-srcmiddlewareerrorhandlerts--central-error-handler)),
which logs it and returns a generic `500`.

### `loginController`
1. Read `{ email, password, remember }` from the (already‑validated) body.
2. `loginService(...)` → `IssuedTokens` on success, `null` on bad credentials.
3. `null` → `400 { message: "Invalid email or password" }` (same message for "no such user"
   and "wrong password" — no user enumeration).
4. Success → `setAuthCookies(res, tokens)` then `200 { message: "Logged in" }`.

### `registerController`
1. Read `{ email, username, password, accept }`.
2. `registerService(...)` → the new user object, **or** `{ conflict: "email" | "username" }`.
3. `"conflict" in result` → `409` with `"Email already registered"` / `"Username already taken"`.
4. Otherwise → `201 { user }` (user = `{ id, email, username, createdAt }`).

### `refreshController`
1. Read `req.cookies?.refreshToken`. Missing → `401 { message: "No refresh token." }`.
2. `refreshService(token)` → new `IssuedTokens`, or `null` if the token is invalid/expired/unknown.
3. `null` → clear both cookies + `401 "Invalid or expired refresh token"`.
4. Success → `setAuthCookies` (the tokens are **rotated** — see service) + `200 "Refreshed"`.
   A real error (e.g. DB down) throws through to the central handler → `500`.

### `logoutController`
1. `clearAuthCookies(res)` **unconditionally** — logout must always clear client state.
2. `logoutService(req.cookies?.refreshToken)` as best‑effort; a failure is `.catch`‑logged, not
   surfaced.
3. Always `200 { message: "Logged out" }`.

---

## `auth.service.ts` — business logic

Holds **no raw Prisma calls** — every query goes through `auth.repository.ts`. The service
decides what a repository result *means* (bad credentials? a race? an expired token?);
the repository just fetches/writes.

Return contract: **`null` (or a small result object) = an expected failure; `throw` = something
unexpected.** Controllers rely on this to pick 4xx vs 5xx.

### `loginService(email, password, remember): Promise<IssuedTokens | null>`
1. `findUserByEmail(email)`.
2. No user, **or** `argon2.verify(hash, password)` fails → return `null`.
3. `issueTokens(user.id, remember)` → access + refresh JWT + lifetime.
4. `createRefreshToken({ hashedToken: hashToken(refreshToken), userId, remember, expiresAt })` —
   sha256 of the token is stored, never the raw value.
5. Return `{ accessToken, refreshToken, remember, refreshTokenMaxAge }`.

### `registerService(email, username, password, accept): Promise<user | RegisterConflict>`
1. `findUserIdByEmail` + `findUserIdByUsername` in parallel (unique‑index hits).
2. `email` taken → `{ conflict: "email" }`; else `username` taken → `{ conflict: "username" }`.
   Email is checked first.
3. `createUser({ email, username, password: await argon2.hash(password), accept })` — the
   repository's `omit` already strips `password`/`accept`/`updatedAt` from the result.
4. `catch`: a Prisma `P2002` (unique violation) here means a **race** — someone inserted a
   matching row between step 1 and step 3 — so return `{ conflict: "email" }` as a fallback.
   Any other error is re‑thrown. (Interpreting the Prisma error code is why the service still
   imports `Prisma` from the generated client, even though it never calls `prisma` directly.)

### `refreshService(currentRefreshToken): Promise<IssuedTokens | null>`
1. `verifyRefreshToken(token)` — bad signature / expired JWT is caught and becomes `null`.
2. `findRefreshTokenByHash(hashToken(token))`.
3. Not found, or `expiresAt` in the past → `deleteRefreshTokenById` the stale row if present,
   return `null`.
4. **Rotation:** `rotateRefreshToken(...)` — one `$transaction` that deletes the old row and
   creates a new one for a freshly minted pair. The old refresh token is now dead — a stolen
   token is single‑use.
5. New lifetime follows the stored `remember` flag.
6. Return the new `IssuedTokens`.

### `logoutService(refreshToken?): Promise<void>`
- No token → return.
- `deleteRefreshTokenByHash(hashToken(refreshToken))` — backed by `deleteMany`, which returns
  `{ count: 0 }` instead of throwing when nothing matches, so logout is idempotent.

---

## `auth.repository.ts` — raw data access

Every Prisma call for this feature, each as a small named function. No business logic, no
error interpretation — that's the service's job (see above).

| Function | Query |
|----------|-------|
| `findUserByEmail(email)` | `prisma.user.findUnique({ where: { email } })` |
| `findUserIdByEmail(email)` | same, `select: { id: true }` — for the register conflict check |
| `findUserIdByUsername(username)` | same, by `username` |
| `createUser({ email, username, password, accept })` | `prisma.user.create`, with the response `omit` baked in |
| `createRefreshToken({ hashedToken, userId, remember, expiresAt })` | `prisma.refreshToken.create` |
| `findRefreshTokenByHash(hashedToken)` | `prisma.refreshToken.findUnique` |
| `deleteRefreshTokenById(id)` | `prisma.refreshToken.delete` |
| `deleteRefreshTokenByHash(hashedToken)` | `prisma.refreshToken.deleteMany` |
| `rotateRefreshToken({ oldId, hashedToken, userId, remember, expiresAt })` | `prisma.$transaction([delete, create])` |

Callers pass an already‑hashed token — hashing happens in the service (`hashToken` is a `lib`
primitive; *deciding* to hash before storing is policy).

---

## `auth.tokens.ts` — `issueTokens(userId, remember)`

The single place that decides *what an authenticated session gets*:

```ts
accessToken   = signToken({ sub: userId })          // 15 min  (ACCESS_TOKEN.jwtExpiration)
refreshToken  = signRefreshToken({ sub: userId })   // 60 d    (REFRESH_TOKEN.jwtExpiration)
{ refreshTokenMaxAge, expiresAt } = getRefreshTokenLifetime(remember)  // cookie + DB lifetime
```

Returns `MintedTokens` = `{ accessToken, refreshToken, refreshTokenMaxAge, expiresAt }`.
Used by both `loginService` and `refreshService`. Durations come from
[`#lib/tokenPolicy`](./lib.md#tokenpolicyts).

---

## `auth.cookies.ts` — cookie transport

```ts
baseCookie = { httpOnly: true, secure: isProduction, sameSite: "strict" }
```

| Attribute            | Reason |
|----------------------|--------|
| `httpOnly`           | JS (`document.cookie`) cannot read it → XSS can't steal the token |
| `secure` (prod only) | only sent over HTTPS |
| `sameSite: "strict"` | never sent on cross‑site requests → strong CSRF protection |

`setAuthCookies(res, tokens)`
- `accessToken` cookie, `maxAge = ACCESS_TOKEN.maxAgeMs` (from `#lib/tokenPolicy`).
- `refreshToken` cookie, `maxAge = refreshTokenMaxAge` **only if `remember`** — otherwise a
  *session cookie* (dies when the browser closes).

`clearAuthCookies(res)`
- `res.clearCookie(name, baseCookie)` — the options **must** match how the cookie was set
  (`path`, `secure`, `sameSite`) or the browser won't remove it.

---

## `auth.types.ts` — shared types (imports nothing)

| Type              | Shape | Used by |
|-------------------|-------|---------|
| `MintedTokens`    | `{ accessToken, refreshToken, refreshTokenMaxAge, expiresAt }` | return of `issueTokens` |
| `IssuedTokens`    | `{ accessToken, refreshToken, remember, refreshTokenMaxAge }` | services → controller → cookies |
| `RegisterConflict`| `{ conflict: "email" \| "username" }` | `registerService` result |

---

## How the token model works (the big picture)

- **Access token** — short‑lived (15 min) JWT, sent as an `httpOnly` cookie. Would authorize
  requests to protected endpoints (middleware not built yet). Stateless: never in the DB.
- **Refresh token** — long‑lived JWT (`exp` 60 d), `httpOnly` cookie. Its **sha256 hash** is a
  row in `RefreshToken`. Used only to get a new access token. The DB row's `expiresAt` (1 d, or
  60 d if "remember") is the real per‑session gate — checked on every `/auth/refresh`.
- **Refresh flow** — `POST /auth/refresh` verifies the refresh token, checks it's still in the
  DB and unexpired, then **rotates**: old row deleted, new pair issued, in one transaction.
- **Logout** — deletes the refresh‑token row and clears both cookies. The access token can't be
  revoked (stateless) but expires within 15 min.
- **"Remember me"** — `true`: refresh cookie + DB row persist 60 days. `false`: 1‑day DB expiry
  and a browser‑session cookie (gone on browser close).
