# Documentation

Project: a small full‑stack **Express + JWT auth** app with a **React** client.

| Area | Docs | Summary |
|------|------|---------|
| Backend  | [backend/](./backend/README.md)  | Express 5 API, Prisma 7 / Postgres, argon2, `jose` JWTs, httpOnly‑cookie auth with refresh‑token rotation |
| Frontend | [frontend/](./frontend/README.md) | React 19 + Vite SPA, axios with a 401 auto‑refresh interceptor, SCSS (7‑1 + CSS Modules) |

Each folder has its own `README.md` index. Start there.

## How auth works end to end

1. Client `POST`s credentials to `/auth/login` (or `/auth/register`).
2. Backend verifies, issues an **access** JWT (15 min) + a **refresh** JWT (rotated, stored
   hashed in the DB), both as `httpOnly` `SameSite=strict` cookies.
3. Client makes requests via the shared axios instance (`withCredentials: true`); cookies ride
   along automatically.
4. On a `401`, the axios interceptor calls `/auth/refresh` once (queuing concurrent failures),
   gets fresh cookies, and replays the failed request.
5. `/auth/logout` deletes the refresh‑token row and clears both cookies.

Dev: Vite proxies `/auth/*` to the backend on `:3000`, so it's same‑origin and cookies work
with no CORS setup.
