# Routing, pages & the auth gate

[← index](./README.md) · API access split is in [layers.md](./layers.md).

## `index.html`

Vite's entry. One `<div id="root">` and `<script type="module" src="/src/main.tsx">`.

## `src/main.tsx`

```tsx
import "@fontsource/montserrat/400.css";   // + 500, 700
import "./styles/main.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
```

- **`<AuthProvider>` wraps everything** so `useAuth()` works in any route (including
  `<ProtectedRoute>`). It's outside `<BrowserRouter>` because it doesn't need routing.
- **`StrictMode`** — dev‑only double‑invoke of renders/effects.
- **`BrowserRouter`** — history API routing; the dev/prod server must fall back to `index.html`
  for unknown paths (Vite does this in dev).
- **`react-router` v8** — import everything from `react-router` (no `react-router-dom`).

## Routes

| Path         | Component   | Guard | Purpose |
|--------------|-------------|-------|---------|
| `/`          | `Login`     | —     | login form |
| `/register`  | `Register`  | —     | registration form |
| `/dashboard` | `Dashboard` | `<ProtectedRoute>` | authenticated area |

No 404 / catch‑all route yet — see [todo.md](./todo.md).

## `src/components/ProtectedRoute.tsx` — the gate

```tsx
const ProtectedRoute = () => {
  const auth = useAuth();
  if (auth.status === "loading") return <p>Loading…</p>;
  if (auth.status === "guest")   return <Navigate to="/" replace />;
  return <Outlet />;
};
```

- A **layout route** — nested `<Route>`s render through its `<Outlet />`.
- `loading` → placeholder while `<AuthProvider>` resolves `/auth/me`.
- `guest` → redirect to `/` (`replace` so back doesn't return to the guarded URL).
- `authed` → render the child route.

**This is UX only.** The real protection is the backend `requireAuth` middleware on every
`/auth/*`‑style data route — a user who forces their way to `/dashboard` just gets `401`s and
no data. See [backend/request-flow.md](../backend/request-flow.md#5-srcmiddlewarerequireauthts--protecting-routes).

## Pages

Each page is markup only — all state and behaviour come from a hook in `src/hooks/`
([layers.md → presentation](./layers.md#4-presentation--srchooks-srcpages-srccomponents)).

### `Login.tsx` — `useLogin()`
- `{ email, password, remember }` form + `submit` → `authApi.login()` → `refetch()` (updates the session) → `navigate("/dashboard")`.
- Renders an `error` `<p role="alert">` and a `disabled`/"Logging in…" submit button while `pending`.
- Footer link → `/register`.

### `Register.tsx` — `useRegister()`
- `{ username, email, password, confirmPassword, accept }` form + `submit` → `authApi.register()` → `navigate("/")` (register does **not** log you in — the backend sets no cookies).
- Same error / pending UI.
- Footer link → `/`.

> Form body shapes map 1:1 to the backend zod schemas
> ([backend/auth.md](../backend/auth.md#authvalidatets--request-body-schemas)).

### `Dashboard.tsx`
- Reads `useAuth()` — `<ProtectedRoute>` guarantees `status === "authed"`, so `auth.user` is available.
- Shows `Welcome, {username}` + a **Log out** button → `authApi.logout()` → `refetch()` → `navigate("/")`.

## The auth flow, end to end

1. App loads → `<AuthProvider>` calls `authApi.me()`.
   - **has valid session** → `authed`, dashboard reachable.
   - **access token expired** → `/auth/me` 401 → interceptor calls `/auth/refresh` → retries `/auth/me` → `authed`.
   - **no session** → both fail → `guest`.
2. User submits login → cookies set → `refetch()` flips state to `authed` → `navigate("/dashboard")`.
3. `<ProtectedRoute>` sees `authed` → renders `<Dashboard>`.
4. Logout → cookies cleared → `refetch()` → `guest` → any later visit to `/dashboard` redirects to `/`.
