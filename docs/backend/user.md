# The `user` feature

[← index](./README.md) · see also [api.md](./api.md) for the endpoint reference and
[request-flow.md](./request-flow.md) for `validate` / `validateQuery` / `requireAuth`.

Files: `src/features/user/` — `user.route.ts`, `user.controller.ts`, `user.service.ts`,
`user.repository.ts`, `user.validate.ts`, `user.types.ts`.

Admin-facing user management: create a user, aggregate status counts, list users with
pagination. Same layering as [auth](./auth.md) — this doc assumes you've read that one.

---

## `user.validate.ts` — request schemas

`addUserSchema` — body for `POST /user/add`:

| Field            | Rule                                     | Why |
|------------------|-------------------------------------------|-----|
| `email`          | `z.email().toLowerCase().trim()`          | same normalization as auth |
| `username`       | `z.string().trim().min(3).max(30)`        | length bounds |
| `password`       | `z.string().min(8).max(128)`              | same policy as register |
| `confirmPassword`| `z.string()`                              | compared below |
| `role`           | `z.enum(["staff", "admin", "manager"])`   | **not** a bare string — rejects anything outside the allow-list before it ever reaches the DB |
| `status`         | `z.enum(["active", "inactive", "suspended"])` | same reasoning |
| *(object)*       | `.refine(password === confirmPassword)`   | same cross-field check as `registerSchema` |

`paginationSchema` — **query** params for `GET /user/list`:

| Field      | Rule                                         | Why |
|------------|-----------------------------------------------|-----|
| `page`     | `z.coerce.number().min(1).default(1)`        | query values are always strings (`?page=2` → `"2"`) — `z.coerce` converts before validating |
| `pageSize` | `z.coerce.number().min(10).max(50).default(10)` | the `max(50)` caps how large a page a client can request |

Validated via `validateQuery`, not `validate` — see [request-flow.md](./request-flow.md#6-srcmiddlewarevalidatequeryts--query-string-validation), because `req.query` can't be
reassigned the way `req.body` can (Express 5 made it getter-only).

---

## `user.controller.ts` — HTTP layer

Same shape as the auth controllers: read input → call one service → map the result → respond.
No `try/catch` — unexpected throws go to the central `errorHandler`.

### `addUserController` — behind `requireAuth`, `validate(addUserSchema)`
1. Read `{ email, username, password, role, status }` from the validated body.
2. `addUserService(...)` → the new user, **or** `{ conflict: "email" | "username" }`.
3. `"conflict" in result` → `409` with `"Email already registered"` / `"Username already taken"`.
4. Otherwise → `201 { user }`.

### `statusUserController` — behind `requireAuth`
1. `getUserStatusesService()` → `UserStatusCounts`.
2. `200` with the counts object directly (no wrapper key).

### `paginationUserController` — behind `requireAuth`, `validateQuery(paginationSchema)`
1. Read `{ page, pageSize }` from `req.validatedQuery` — **not** `req.query` (see below).
2. `getUsersPaginationService(page, pageSize)` → `PaginatedUsers`.
3. `200` with `{ total, users }` directly.

```ts
const { page, pageSize } = req.validatedQuery as z.infer<typeof paginationSchema>;
```
`req.validatedQuery` is typed `unknown` in `src/types/express.d.ts` (it has to be — that
declaration is global, shared by every route, so it can't know route-by-route which schema
validated it). The `as` cast recovers the specific shape for this one handler. This is the same
category of "trust the middleware already ran" assertion `meController` makes with
`req.userId!` — Express's type system doesn't thread per-middleware guarantees through to the
handler, so one explicit annotation per route is unavoidable in vanilla Express + TS.

---

## `user.service.ts` — business logic

Same return contract as auth: an expected failure is a `null`/result-object return, not a throw.

### `addUserService(email, username, password, role, status): Promise<user | AddUserConflict>`
1. `findUserIdByEmail` + `findUserIdByUsername` in parallel.
2. `email` taken → `{ conflict: "email" }`; else `username` taken → `{ conflict: "username" }`.
3. `addUser({ ..., password: await argon2.hash(password), accept: true })` — admin-created
   users are auto-accepted (no terms-and-conditions step for them).
4. `catch`: a `P2002` here means a race between steps 1–3 → `{ conflict: "email" }` fallback,
   same pattern as `registerService`.

### `getUserStatusesService(): Promise<UserStatusCounts>`
```ts
const [total, byStatus] = await Promise.all([countUsers(), countUsersByStatus()]);
const counts: UserStatusCounts = { total, active: 0, inactive: 0, suspended: 0 };

for (const group of byStatus) {
  if (group.status === "active" || group.status === "inactive" || group.status === "suspended") {
    counts[group.status] = group._count._all;
  }
}
```
`countUsersByStatus` (a Prisma `groupBy`) only returns rows for statuses that actually exist in
the table — the loop fills in `0` for any that don't. The `===`/`||` chain isn't just a runtime
check: TypeScript doesn't narrow `group.status` from `string` to the literal union any other
way (`Array.prototype.includes` doesn't narrow in this TS version — confirmed by testing), so
without it `counts[group.status] = ...` wouldn't type-check.

### `getUsersPaginationService(page, pageSize): Promise<PaginatedUsers>`
```ts
const [total, users] = await Promise.all([countUsers(), getUsersByPagination(page, pageSize)]);
return { total, users };
```
Both queries run concurrently. `total` must come from a **separate, unfiltered** `count()` —
not from `users.length` — because `users` is only the current page (at most `pageSize` rows).

---

## `user.repository.ts` — raw data access

| Function | Query |
|----------|-------|
| `findUserIdByEmail(email)` | `prisma.user.findUnique({ where: { email }, select: { id: true } })` |
| `findUserIdByUsername(username)` | same, by `username` |
| `addUser({ email, username, password, role, status, accept })` | `prisma.user.create`, `omit: { password, accept, updatedAt }` — keeps `role`/`status` in the response (unlike auth's `createUser`, which this admin-facing response doesn't need to hide) |
| `countUsers()` | `prisma.user.count()` — total row count, no filter |
| `countUsersByStatus()` | `prisma.user.groupBy({ by: ["status"], _count: { _all: true } })` |
| `getUsersByPagination(page, pageSize)` | `prisma.user.findMany({ skip, take, orderBy: { createdAt: "desc" }, omit: { password, email, updatedAt, accept } })` |

`skip`/`take` for `getUsersByPagination`:
```ts
skip: (page - 1) * pageSize,
take: pageSize,
```
Page 1 → `skip: 0`. Page 2 → `skip: pageSize`. `orderBy` is required for pagination to be
stable — without a deterministic sort, Postgres doesn't guarantee the same row order across
separate queries, so pages could repeat or skip rows as data changes between requests.

This is **offset pagination** (`skip`/`take`), not cursor-based — the right choice when the UI
has page numbers (jump to page 5), which cursor pagination can't do (it only supports
"next batch after X"). Cursor pagination wins at very large scale / high write-concurrency,
neither of which applies to an admin user table.

Note: `getUsersByPagination`'s `omit` excludes `email` from list rows — different from `addUser`'s
`omit`, which keeps it. These are genuinely different shapes for different purposes; that's why
`UserListItem` (in `user.types.ts`) derives from Prisma's `omit` directly instead of being a
hand-written type that could drift out of sync with either.

---

## `user.types.ts`

| Type | Shape | Used by |
|------|-------|---------|
| `AddUserConflict` | `{ conflict: "email" \| "username" }` | `addUserService` result |
| `UserStatusCounts` | `{ total, active, inactive, suspended }` (all `number`) | `getUserStatusesService` result |
| `UserListItem` | `Prisma.UserGetPayload<{ omit: { password; email; updatedAt; accept } }>` — derived from Prisma, not hand-written, so it can't drift from the repository's actual `omit` | one row in `PaginatedUsers.users` |
| `PaginatedUsers` | `{ total: number, users: UserListItem[] }` | `getUsersPaginationService` result |

---

## Routes (`user.route.ts`)

| Method & path | Middleware | Controller |
|---|---|---|
| `POST /user/add` | `requireAuth`, `validate(addUserSchema)` | `addUserController` |
| `GET /user/status` | `requireAuth` | `statusUserController` |
| `GET /user/list` | `requireAuth`, `validateQuery(paginationSchema)` | `paginationUserController` |

**None of these have a role check yet** — `requireAuth` only proves "logged in," not "is an
admin." Any authenticated user can currently create another user with `role: "admin"`, or read
the user list/counts. See [todo.md](./todo.md) — a `requireRole("admin")` middleware is planned
but not yet wired in.
