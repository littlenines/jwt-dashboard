# Known gaps / hardening backlog

[← index](./README.md)

- **No `/user/*` route has a role check — privilege escalation.** All three
  (`POST /user/add`, `GET /user/status`, `GET /user/list`) are behind `requireAuth` only, which
  proves "logged in," not "is an admin." Any authenticated user can currently create a new user
  with `role: "admin"`, or read the user list/status counts. Needs a `requireRole("admin")`
  middleware (query `req.userId`'s role via `#lib/prisma`, same pattern `requireAuth` uses with
  `#lib/jwt`) added to all three routes in `user.route.ts`. Planned, not yet done.
- **No rate limiting** on `/login` and `/register` — brute force / enumeration is unbounded.
- `.env` `APP_ENV` is `"locale"`. It works (anything ≠ `"production"` = dev), but rename it to
  something sensible, and set `APP_ENV=production` in the deployed environment or `Secure`
  cookies stay off. (Consider standardizing on `NODE_ENV`.)
- `email` conflict on register is currently revealed explicitly (`"Email already registered"`).
  Fine for now; if email enumeration matters, make that path vague (or 200 + send a mail) while
  keeping the username message specific — `registerService` already reports which field.
- Consider making the login "user not found" path run a dummy `argon2.verify` to equalize
  response timing (prevents email enumeration by timing).
