# Routing & entrypoint

[← index](./README.md)

## `index.html`

Vite's entry. One `<div id="root">` and `<script type="module" src="/src/main.tsx">`. Vite
injects the bundle here.

## `src/main.tsx`

```tsx
import "@fontsource/montserrat/400.css";   // + 500, 700
import "./styles/main.scss";               // the global stylesheet manifest

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
```

- **`StrictMode`** — dev‑only double‑invoke of renders/effects to surface impure code. No
  production effect.
- **`BrowserRouter`** — history API routing (clean URLs, no `#`). Needs the dev/prod server to
  fall back to `index.html` for unknown paths; Vite does this automatically in dev.
- **`react-router` v8** — import from `react-router` directly (`Routes`, `Route`, `Link`,
  `BrowserRouter`). There is no `react-router-dom` in v7+.
- Global CSS + fonts are imported here so they load once for the whole app.

## Routes

| Path        | Component  | Purpose |
|-------------|------------|---------|
| `/`         | `Login`    | login form |
| `/register` | `Register` | registration form |

No catch‑all / 404 route, no protected routes, no authenticated area yet — see
[todo.md](./todo.md).

## Pages

Both pages follow the same pattern:

```tsx
const [form, setForm] = useState({ /* all fields */ });

const submit = async (event: SubmitEvent<HTMLFormElement>) => {
  event.preventDefault();
  await api.post("auth/login", form);   // or auth/register
};

return (
  <AuthLayout title=... subtitle=... onSubmit={submit} footer={...} illustration={{...}}>
    <Input ... value={form.x} onChange={e => setForm({ ...form, x: e.target.value })} />
    ...
    <SubmitButton>Log in</SubmitButton>
  </AuthLayout>
);
```

### `Login.tsx`
- State: `{ email, password, remember }`.
- Fields: email `<Input>`, password `<Input>`, "Remember me" `<Checkbox>`, submit.
- Footer link → `/register`.

### `Register.tsx`
- State: `{ username, email, password, confirmPassword, accept }`.
- Fields: username, email, password, confirm password, "Accept terms" `<Checkbox>`, submit.
- Footer link → `/`.

> The request body shapes map 1:1 to the backend zod schemas
> ([backend/auth.md](../backend/auth.md#authvalidatets--request-body-schemas)).

### Current limitations (see [todo.md](./todo.md))
- `await api.post(...)` has **no `try/catch`** — a `400`/`409`/network failure is an unhandled
  rejection; the user sees nothing.
- **No success handling** — no `navigate()` after login/register, no auth state.
- No submit disabled/loading state.
