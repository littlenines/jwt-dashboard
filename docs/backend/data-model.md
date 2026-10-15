# Data model (`prisma/schema.prisma`)

[← index](./README.md)

## `User`

| Field         | Type       | Constraints / default        | Meaning |
|---------------|------------|------------------------------|---------|
| `id`          | `String`   | PK, `@default(uuid())`       | primary key, also the JWT `sub` claim |
| `email`       | `String`   | `@unique`                    | login identifier, stored lowercased/trimmed |
| `username`    | `String`   | `@unique`                    | public handle |
| `password`    | `String`   | —                            | **argon2 hash**, never the plaintext |
| `role`        | `String`   | `@default("staff")`          | `"staff" \| "admin" \| "manager"` — **not** a Prisma enum, just a plain string column; the allow‑list is enforced by zod (`addUserSchema`) at the API boundary, not by the DB |
| `status`      | `String`   | `@default("active")`         | `"active" \| "inactive" \| "suspended"` — same caveat as `role` |
| `accept`      | `Boolean`  | `@default(false)`            | accepted terms & conditions at signup |
| `createdAt`   | `DateTime` | `@default(now())`            | |
| `updatedAt`   | `DateTime` | `@updatedAt`                 | auto‑maintained — bumped by **any** update to the row (role/status edits, `lastLoginAt` touches, …), not specifically logins; see `lastLoginAt` below |
| `lastLoginAt` | `DateTime?`| nullable, no default         | set explicitly by `loginService` on every successful login — `updatedAt` is **not** a reliable proxy for this |
| `refreshTokens`| `RefreshToken[]` | relation               | all active/known refresh tokens for this user |

## `RefreshToken`

One row per issued refresh token. Lets the server **revoke** refresh tokens (logout, rotation)
even though JWTs are otherwise stateless.

| Field        | Type       | Constraints / default | Meaning |
|--------------|------------|-----------------------|---------|
| `id`         | `String`   | PK, `@default(uuid())`| |
| `hashedToken`| `String`   | `@unique`             | **sha256** of the raw refresh JWT. The raw token is never stored — a DB leak can't be replayed. |
| `userId`     | `String`   | FK → `User.id`, `onDelete: Cascade` | owner; deleting the user deletes their tokens |
| `remember`   | `Boolean`  | `@default(false)`     | was "remember me" checked — controls lifetime on rotation |
| `expiresAt`  | `DateTime` | —                     | server‑side expiry check (independent of the JWT's own `exp`) |
| `createdAt`  | `DateTime` | `@default(now())`     | |

Migrations in `prisma/migrations/` are the source of truth for the actual DB schema; run
`pnpm prisma:migrate` after editing `schema.prisma`.

---

## Seeding (`prisma/seed.ts`)

Creates the first **admin** account. Every `/user/*` route sits behind `requireAuth`, and
`/auth/register` only creates `role: "staff"` users, so on an empty database there's no other
way in as an admin.

```sh
pnpm prisma:seed        # = prisma db seed -> runs `tsx prisma/seed.ts` (set in prisma.config.ts)
```

Reads `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` from `.env` (see
[conventions.md](./conventions.md#environment-variables-env)). What it does:

1. **Checks the password** — missing or shorter than 8 characters → throws before touching the
   DB. Same minimum as `registerSchema` / `addUserSchema`.
2. **Checks for a username clash** — if a *different* email already owns `ADMIN_USERNAME`, it
   throws `Username "…" is already taken by …`. Without this, the create step would fail with an
   opaque `P2002` unique-constraint error. It deliberately doesn't take over or rename that user.
3. **Upserts by email**:
   - no user with `ADMIN_EMAIL` → **create** with `role: "admin"`, `status: "active"`,
     `accept: true`, and the argon2-hashed password;
   - user exists → **update only the password**. So changing `ADMIN_PASSWORD` and re-seeding
     resets it; nothing else on the row (username, role, status) is touched.
4. Logs `Seeded admin: <email>` — the row is fetched with `omit: { password: true }` so the
   hash never reaches the console.
5. `prisma.$disconnect()` in `.finally()`; a failure sets `process.exitCode = 1` so
   `prisma db seed` reports it.

It's **idempotent** — safe to run any number of times. Notes:

- It imports the app's own client (`../src/lib/prisma`), so it connects exactly like the server:
  `PrismaPg` adapter, `DATABASE_URL`. It doesn't open its own `pg` `Pool` — the adapter manages
  one internally, and `$disconnect()` closes it.
- Resetting the password does **not** revoke existing refresh tokens; sessions already signed in
  stay signed in until their tokens expire or they log out.
- `ADMIN_EMAIL` is stored exactly as written. Login lowercases and trims the email it receives
  (`loginSchema`), so keep `ADMIN_EMAIL` lowercase or you won't be able to log in with it.
- `prisma/` isn't in `tsconfig.json`'s `include`, so `tsc` doesn't type-check the seed — errors
  only show up when it runs. Intentional.
