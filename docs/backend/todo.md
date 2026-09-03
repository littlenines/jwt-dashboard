# Known gaps / hardening backlog

[← index](./README.md)

- **No `requireAuth` middleware / protected routes yet.** `verifyToken` (access) is unused.
  Needed for any `/me`‑style endpoint.
- **No rate limiting** on `/login` and `/register` — brute force / enumeration is unbounded.
- `.env` `APP_ENV` is `"locale"`. It works (anything ≠ `"production"` = dev), but rename it to
  something sensible, and set `APP_ENV=production` in the deployed environment or `Secure`
  cookies stay off. (Consider standardizing on `NODE_ENV`.)
- `email` conflict on register is currently revealed explicitly (`"Email already registered"`).
  Fine for now; if email enumeration matters, make that path vague (or 200 + send a mail) while
  keeping the username message specific — `registerService` already reports which field.
- Consider making the login "user not found" path run a dummy `argon2.verify` to equalize
  response timing (prevents email enumeration by timing).
