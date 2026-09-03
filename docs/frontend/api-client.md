# API client (`src/config/api.ts`)

[← index](./README.md)

A single configured axios instance, exported as `api`. Every request the app makes goes
through it.

```ts
const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});
```

| Option                  | Why |
|-------------------------|-----|
| `baseURL: "/"`          | relative URLs → the Vite dev proxy forwards `/auth/*` to `:3000` (see [conventions.md](./conventions.md#the-dev-proxy--why-it-matters)) |
| `withCredentials: true` | send + store cookies. The backend auth is **httpOnly cookies**, so the browser holds the tokens and JS never touches them. |

The app never reads or sets a token — it just makes requests and the cookies ride along.

---

## The 401 auto‑refresh interceptor

Goal: when an access token has expired, transparently call `/auth/refresh` and replay the
failed request, so the user never notices. Concurrent failures must trigger **one** refresh,
not N.

```ts
let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle a first-time 401. Anything else (or an already-retried request) rejects.
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // A refresh is already running → park this request until it finishes.
    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push(() => resolve(api(originalRequest)));
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/auth/refresh");     // backend rotates + re-sets cookies
      pendingRequests.forEach((retry) => retry());   // release the queue
      pendingRequests = [];
      return api(originalRequest);          // retry the request that triggered all this
    } catch (refreshError) {
      pendingRequests = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
```

### Walkthrough

1. Response is a success → passed straight through.
2. Response is an error:
   - not `401`, or `_retry` already set → reject (give up).
   - `401`, first time:
     - **if a refresh is in flight** → return a pending promise; it resolves later by
       re‑issuing `originalRequest` through `api` (which itself may re‑enter the interceptor,
       but by then the cookie is fresh).
     - **otherwise** → mark `_retry`, flip `isRefreshing`, `POST /auth/refresh`.
       - success → run every queued retry, clear the queue, retry the original request.
       - failure → clear the queue, reject (the caller must handle "logged out").
3. `finally` always resets `isRefreshing`.

### `_retry`

A flag stamped onto the axios request config so a request is only ever retried **once** — a
second 401 on the same request rejects instead of looping.

### Backend side

`POST /auth/refresh` verifies the refresh cookie, checks the DB row, **rotates** the token
(old one invalidated), and sets new `accessToken` + `refreshToken` cookies. See
[backend/auth.md](../backend/auth.md#refreshservicecurrentrefreshtoken-promiseissuedtokens--null).

---

## Known weaknesses (also in [todo.md](./todo.md))

- **Queued promises leak on refresh failure.** If `POST /auth/refresh` rejects, the promises
  parked in `pendingRequests` (created via `new Promise((resolve) => ...)`) are never resolved
  **or** rejected — those requests hang forever. The `catch` clears the array but doesn't
  settle the promises. Fix: keep `reject` too and call it in the `catch`.
- **Queued retries don't set `_retry`.** A queued request that still 401s after refresh can
  re‑enter and start another refresh.
- No cap / backoff — a persistently‑401 endpoint plus a working refresh could loop through the
  "retry once" path repeatedly across separate calls.
- Module‑level `isRefreshing` / `pendingRequests` — fine for one instance, but it's shared
  global state; keep it in mind if a second axios instance is added.
