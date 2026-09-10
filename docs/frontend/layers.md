# The 4 layers

[← index](./README.md)

```
network        →  data          →  state                →  presentation
src/lib/http.ts   src/api/auth.ts   src/context/auth/*     src/pages/*, src/components/*
```

Rule: **a component never imports `axios`, `http`, or a URL string.** It goes through the data
layer (or the state layer for session info).

---

## 1. Network — `src/lib/http.ts`

The single configured axios instance. Knows *how* to talk to the server, nothing about which
endpoints exist.

```ts
export const http = axios.create({
  baseURL: "/",           // relative → the Vite dev proxy forwards /auth/* to :3000
  withCredentials: true,  // send + receive the httpOnly auth cookies
});
```

The app never reads or writes a token — the cookies ride along automatically.

### The 401 auto‑refresh interceptor

When the access token has expired, transparently `POST /auth/refresh` and replay the failed
request. Concurrent 401s trigger **one** refresh, not N.

```ts
let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // only a first-time 401 is handled; anything else rejects
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // a refresh is already running → park this request until it finishes
    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push(() => resolve(http(originalRequest)));
      });
    }

    originalRequest._retry = true;   // retry a given request at most once
    isRefreshing = true;

    try {
      await http.post("/auth/refresh");            // backend rotates + re-sets cookies
      pendingRequests.forEach((retry) => retry()); // release the queue
      pendingRequests = [];
      return http(originalRequest);                // retry the one that started it
    } catch (refreshError) {
      pendingRequests = [];
      return Promise.reject(refreshError);         // caller must handle "logged out"
    } finally {
      isRefreshing = false;
    }
  },
);
```

`_retry` is a flag stamped on the request config so a request that 401s *again* after a
refresh rejects instead of looping. Backend side of the refresh:
[backend/auth.md](../backend/auth.md#refreshservicecurrentrefreshtoken-promiseissuedtokens--null).

> **Known weaknesses** (see [todo.md](./todo.md)): queued promises hang if the refresh itself
> fails; queued retries don't set `_retry`.

### `src/lib/apiError.ts`

`getErrorMessage(err, fallback?)` — turns a thrown value (usually an axios error) into one
user‑facing string. Understands the backend's two error shapes: `{ message }` and
`{ errors: { field: [...] } }`. Used by the presentation layer.

---

## 2. Data — `src/api/auth.ts`

The auth endpoints, their shapes, and nothing else. Built on `http`; the only file (besides the
interceptor) that contains a `/auth/*` string.

```ts
export const authApi = {
  login:    (body: LoginInput)    => http.post<{ message: string }>("/auth/login", body).then(r => r.data),
  register: (body: RegisterInput) => http.post<{ user: User }>("/auth/register", body).then(r => r.data.user),
  logout:   ()                    => http.post<{ message: string }>("/auth/logout").then(r => r.data),
  me:       ()                    => http.get<{ user: User }>("/auth/me").then(r => r.data.user),
};
```

Errors are left to propagate (axios rejects) — the presentation layer catches and runs them
through `getErrorMessage`.

### `src/types/auth.ts`

Wire shapes, mirroring the backend:

| Type | Matches |
|------|---------|
| `User` | the `omit`ed user the backend returns (`id, email, username, createdAt`) |
| `LoginInput` | `loginSchema` |
| `RegisterInput` | `registerSchema` |

---

## 3. State — `src/context/auth/`

Client‑side session. One folder per context (mirrors the backend's `features/auth/`). Three
files so the ESLint `react-refresh` rule stays happy (a file that exports a component can't
also export a context or hook):

| File | Exports | Contains |
|------|---------|----------|
| `authContext.ts` | `AuthContext`, `AuthState`, `AuthContextValue` | just `createContext(...)` + types — no JSX |
| `AuthProvider.tsx` | `<AuthProvider>` | on mount calls `authApi.me()`; holds `state` + `refetch()` + `clear()` |
| `useAuth.ts` | `useAuth()` | `useContext` + a "must be inside provider" guard |

`AuthState` is a discriminated union:

```ts
type AuthState =
  | { status: "loading" }
  | { status: "authed"; user: User }
  | { status: "guest" };
```

`AuthProvider` starts `loading`, calls `authApi.me()`:
- resolves → `{ status: "authed", user }`
- rejects (interceptor already tried & failed to refresh) → `{ status: "guest" }`

- `refetch()` re‑runs the `/auth/me` check — use it after **login** (you don't have the user
  object yet, only `{ message }`).
- `clear()` just sets `{ status: "guest" }`, no request — use it after **logout** (you already
  know the outcome; hitting `/auth/me` would 401 and also trigger a pointless `/auth/refresh`).

---

## 4. Presentation — `src/hooks/`, `src/pages/`, `src/components/`

Page **logic** lives in a hook; the page component is just markup wired to what the hook
returns. The hook is what talks to the state (`useAuth`) and data (`authApi`) layers.

`src/hooks/`

| Hook | Returns | Does |
|------|---------|------|
| `useFormSubmit()` | `{ error, pending, run }` | `run(action)` wraps an async action in `setError(null) / setPending(true) / try‑catch(getErrorMessage) / finally setPending(false)` |
| `useLogin()` | `{ values, setField, error, pending, submit }` | form state + `submit` → `authApi.login` → `refetch()` → `navigate("/dashboard")` |
| `useRegister()` | `{ values, setField, error, pending, submit }` | form state + `submit` → `authApi.register` → `navigate("/")` |

```tsx
// Login.tsx — the whole component
const Login = () => {
  const { values, setField, error, pending, submit } = useLogin();
  return (
    <AuthLayout onSubmit={submit} /* … */>
      <Input value={values.email} onChange={(e) => setField("email", e.target.value)} />
      {/* … */}
      {error && <p role="alert">{error}</p>}
      <SubmitButton disabled={pending}>{pending ? "Logging in…" : "Log in"}</SubmitButton>
    </AuthLayout>
  );
};
```

`setField` is a typed single‑field updater: `<K extends keyof Values>(key: K, value: Values[K])`.

`<ProtectedRoute>` (the frontend's "guard") and route wiring are in [routing.md](./routing.md).
