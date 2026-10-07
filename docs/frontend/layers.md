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

## 2. Data — `src/api/auth.ts`, `src/api/user.ts`

The endpoints, their shapes, and nothing else. Built on `http`; the only files (besides the
interceptor) that contain a URL string.

```ts
export const authApi = {
  login:    (body: LoginInput)    => http.post<{ message: string }>("/auth/login", body).then(r => r.data),
  register: (body: RegisterInput) => http.post<{ user: User }>("/auth/register", body).then(r => r.data.user),
  logout:   ()                    => http.post<{ message: string }>("/auth/logout").then(r => r.data),
  me:       ()                    => http.get<{ user: User }>("/auth/me").then(r => r.data.user),
};

export const userApi = {
  add:        (body: AddUserInput)              => http.post<{ user: User }>("/user/add", body).then(r => r.data.user),
  status:     ()                                => http.get<UserStatusCounts>("/user/status").then(r => r.data),
  pagination: (page: number, pageSize: number)  => http.get<PaginatedUsers>("/user/pagination", { params: { page, pageSize } }).then(r => r.data),
};
```

> `userApi.pagination` exists as a data-layer call but nothing consumes it yet — there's no hook
> (`useUserList`-style) built on top of it, and `UserTable` is still on mock data. See
> [todo.md](./todo.md).

Errors are left to propagate (axios rejects) — the presentation layer catches and runs them
through `getErrorMessage`.

### `src/types/auth.ts`, `src/types/user.ts`

Wire shapes, mirroring the backend:

| Type | File | Matches |
|------|------|---------|
| `User` (auth) | `types/auth.ts` | the `omit`ed user `/auth/me` returns (`id, email, username, createdAt`) |
| `LoginInput` | `types/auth.ts` | `loginSchema` |
| `RegisterInput` | `types/auth.ts` | `registerSchema` |
| `User` (admin) | `types/user.ts` | a *different, wider* shape — `id, email, username, role, status, lastLoginAt?` — for the admin-facing `/user/*` endpoints. Same name as `types/auth.ts`'s `User`, different fields; the two are never imported into the same file today, but worth knowing if that changes. |
| `AddUserInput` | `types/user.ts` | `addUserSchema` |
| `UserStatusCounts` | `types/user.ts` | the backend's `UserStatusCounts` |
| `UserListItem` | `types/user.ts` | one row of the backend's `PaginatedUsers.users` — `id, username, role, status, createdAt, lastLoginAt`. Hand-written, unlike the backend's Prisma-derived version — can drift if the repository's `omit` changes. |
| `PaginatedUsers` | `types/user.ts` | `{ total: number, users: UserListItem[] }`, matching the backend's `GET /user/pagination` response |

`types/user.ts` also has two unexported, PascalCase union aliases — `Role` (`"staff" \| "admin" \| "manager"`) and `Status` (`"active" \| "inactive" \| "suspended"`) — factored out so `User`, `AddUserInput`, and `UserListItem` don't each repeat the literal union.

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
| `useFormSubmit()` | `{ error, setError, pending, setPending }` | just the shared `error`/`pending` state — each caller drives it with its own `try/catch/finally` |
| `useLogin()` | `{ values, setField, error, pending, submit }` | form state + `submit` → `authApi.login` → `refetch()` → `navigate("/dashboard")` |
| `useRegister()` | `{ values, setField, error, pending, submit }` | form state + `submit` → `authApi.register` → `navigate("/")` |
| `useAddUser(onSuccess)` | `{ values, setField, error, pending, submit }` | form state + `submit` → `userApi.add` → `onSuccess()` |
| `useUserStatuses()` | `UserStatusCounts` (no error/pending exposed) | fetch-on-mount — `userApi.status()` → `setStatus`; failures are `console.error`‑only, counts stay at the zeroed default |

```tsx
// useLogin.ts — the submit function
const submit = async (event: SubmitEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError(null);
  setPending(true);

  try {
    await authApi.login(values);
    refetch();
    navigate("/dashboard");
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setPending(false);
  }
};
```

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
The `try/catch/finally` shape is duplicated across the three hooks rather than hidden behind a
callback-taking wrapper — the state (`useFormSubmit`) is shared, the control flow isn't.

### UI hooks (not page hooks)

`useFormSubmit` / `useLogin` / `useRegister` / `useAddUser` above all belong to a *page* (form
state + a submit flow through the data/state layers). Two more hooks in `src/hooks/` are a
different thing entirely — generic component *behavior*, with no knowledge of auth, data, or state:

| Hook | Returns | Does |
|------|---------|------|
| `useClickOutside(refs, onClickOutside, enabled?)` | — (no return value) | attaches a document `mousedown` listener while `enabled`, calls `onClickOutside()` when the event target is outside **every** ref in `refs` (a single `RefObject` or an array — e.g. `<Select>` passes both its trigger and its menu, since the menu isn't a DOM child of the trigger). Also exempts clicks inside any currently-registered "active overlay" (see `useActiveOverlay` below), so an open `<Select>` nested inside a `<Modal>` doesn't close the modal when you pick an option. The callback and ref list are stashed in `useRef`s (updated in a `useLayoutEffect`, not during render) so the effect's dependency array is just `[enabled]` and doesn't tear down/resubscribe on every render. |
| `useActiveOverlay(ref, active)` | — | registers `ref.current` in a module‑level `Set` while `active` is true. `useClickOutside` treats a click landing inside *any* registered overlay as "inside," regardless of which component's `refs` it's checking against — this is what lets a `<Select>` menu live safely inside a `<Modal>`. |
| `useSelect(onChange)` | `{ open, ref, menuRef, menuStyle, toggle, selectOption }` | open/close state for `<Select>`, built on `useClickOutside([ref, menuRef], close, open)` + `useActiveOverlay(menuRef, open)`. Also computes `menuStyle` (fixed‑position, flips above the trigger if there's not enough room below) via `useLayoutEffect` + scroll/resize listeners — a small floating‑menu positioning system. |
| `useKeyDown(key, handler, enabled?)` | — | document `keydown` listener for one key (e.g. `"Escape"`), same ref‑stashing pattern as `useClickOutside` so the listener doesn't resubscribe every render. `<Modal>` uses it to close on Escape. |

Reusable beyond `<Select>`/`<Modal>` — anything that closes on an outside click or a key press
is meant to reach for these rather than re‑implement the listeners.

`<ProtectedRoute>` (the frontend's "guard") and route wiring are in [routing.md](./routing.md).
