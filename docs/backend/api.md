# API reference

[← index](./README.md)

All under `/auth`. Request bodies are JSON. Auth cookies are set/cleared by the server.
Behaviour details are in [auth.md](./auth.md).

## `POST /auth/register`
```jsonc
// body
{ "email": "a@b.com", "username": "alice", "password": "secret12",
  "confirmPassword": "secret12", "accept": true }
```
| Status | When | Body |
|--------|------|------|
| `201`  | created | `{ "user": { id, email, username, createdAt } }` |
| `400`  | body failed validation | `{ "errors": { field: [msg] } }` |
| `409`  | email or username taken | `{ "message": "Email already registered" \| "Username already taken" }` |
| `500`  | unexpected | `{ "message": "Something went wrong. Please try again later." }` |

## `POST /auth/login`
```jsonc
{ "email": "a@b.com", "password": "secret12", "remember": true }
```
| Status | When | Body / effect |
|--------|------|---------------|
| `200`  | ok | sets `accessToken` + `refreshToken` cookies; `{ "message": "Logged in" }` |
| `400`  | bad body **or** wrong credentials | validation errors, or `{ "message": "Invalid email or password" }` |
| `500`  | unexpected | generic message |

## `POST /auth/refresh`
No body. Requires the `refreshToken` cookie.
| Status | When | Body / effect |
|--------|------|---------------|
| `200`  | ok | rotates + re‑sets both cookies; `{ "message": "Refreshed" }` |
| `401`  | missing / invalid / expired token | clears cookies; `{ "message": ... }` |
| `500`  | unexpected | generic message |

## `GET /auth/me`
No body. Requires a valid `accessToken` cookie (`requireAuth`). Used by the client to check
"am I logged in" and hydrate the session.
| Status | When | Body |
|--------|------|------|
| `200`  | authenticated | `{ "user": { id, email, username, createdAt } }` |
| `401`  | no / invalid / expired access token | `{ "message": "Not authenticated" }` |

> A `401` here is normal when the access token has expired — the client's axios interceptor
> calls `/auth/refresh` and retries automatically.

## `POST /auth/logout`
No body. Uses the `refreshToken` cookie if present.
| Status | When | Body / effect |
|--------|------|---------------|
| `200`  | always | deletes the DB row, clears both cookies; `{ "message": "Logged out" }` |

---

## Security decisions (why it's built this way)

| Decision | Reason |
|----------|--------|
| `argon2` for passwords | memory‑hard; resists GPU/ASIC cracking |
| refresh tokens stored **hashed** | DB leak ≠ session takeover |
| separate `JWT_SECRET` / `JWT_REFRESH` | leak of one doesn't compromise the other |
| `httpOnly` cookies | XSS can't read the tokens |
| `sameSite: "strict"` | CSRF protection without a CSRF token |
| `secure` in production | tokens never traverse plain HTTP |
| refresh‑token **rotation** on every use | a stolen refresh token works at most once |
| same 400 message for "no user" / "wrong password" | no account enumeration on login |
| username conflict is explicit, email conflict *can* be made vague | usernames are public; emails are enumeration‑sensitive (currently both are explicit — see [todo.md](./todo.md)) |
| `helmet` | sensible security headers |
