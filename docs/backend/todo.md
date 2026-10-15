# Known gaps / hardening backlog

[← index](./README.md)

- **Role checks are incomplete — privilege escalation.** `requireRole` exists
  (`src/middleware/requireRole.ts`) but only guards `POST /user/add`:
  - **A manager can create an admin.** `/user/add` allows `requireRole("admin", "manager")`,
    and nothing compares the body's `role` to the caller's — a manager can create an admin and log
    in as it. Either make the route `requireRole("admin")`, or pass the caller's role into
    `addUserService` and only let managers create `staff`.
  - **`GET /user/status` and `GET /user/pagination` have no role check.** Any logged-in user —
    including a `staff` self-registered via `/auth/register` — can read the full user list and
    counts. Add `requireRole(...)` to both.
  - **Order on `/user/add`:** `requireRole` runs after `validate(addUserSchema)`, so an
    unauthorized caller gets `400` field errors before the `403`. Move it right after
    `requireAuth`.
- **Suspended / inactive users can still log in.** `loginService` checks only the password, not
  `status`, so a `suspended` user still gets tokens and can use `/auth/me` and the dashboard shell.
  (`requireRole` does block them from guarded routes.) Check `status` in `loginService`.
- **User search won't scale without an index.** `GET /user/pagination?search=` uses
  `contains` + `mode: "insensitive"` (`ILIKE '%term%'`), which can't use a B-tree index — it's a
  sequential scan. Fine for an admin table of this size; if it grows, add a `pg_trgm` GIN index on
  `username` and `email` (raw SQL in a migration, since Prisma's schema can't declare it).
- **No rate limiting** on `/login` and `/register` — brute force / enumeration is unbounded.
- `.env` `APP_ENV` is `"locale"`. It works (anything ≠ `"production"` = dev), but rename it to
  something sensible, and set `APP_ENV=production` in the deployed environment or `Secure`
  cookies stay off. (Consider standardizing on `NODE_ENV`.)
- `email` conflict on register is currently revealed explicitly (`"Email already registered"`).
  Fine for now; if email enumeration matters, make that path vague (or 200 + send a mail) while
  keeping the username message specific — `registerService` already reports which field.
- Consider making the login "user not found" path run a dummy `argon2.verify` to equalize
  response timing (prevents email enumeration by timing).
