# Known gaps / backlog

[← index](./README.md)

## Auth UX (the big ones)

- **No error handling on submit.** `Login`/`Register` do `await api.post(...)` with no
  `try/catch`. A `400` (bad credentials / validation), `409` (taken), or network error is an
  unhandled promise rejection — the user gets no feedback. Need per‑field + form‑level error
  state, wired from the backend's `{ message }` / `{ errors }` responses.
- **No success handling.** After a `200`/`201` nothing happens — no `navigate()` to an
  authenticated area, no "registered, please log in" state.
- **No auth/session state.** No context/store for "am I logged in", no protected routes, no
  logout button anywhere. `/auth/logout` is never called from the UI.
- **No loading / disabled state** on the submit button while the request is in flight.

## `api.ts` refresh interceptor

- **Queued promises hang on refresh failure.** Requests parked while `isRefreshing` are created
  as `new Promise((resolve) => pendingRequests.push(...))`. If `/auth/refresh` rejects, the
  `catch` clears the array but never settles those promises → they hang forever. Track `reject`
  too and reject them in the `catch`.
- **Queued retries don't set `_retry`.** A replayed request that 401s again can start a second
  refresh cycle.

## Routing

- No 404 / catch‑all route.
- `Register.tsx` "terms and conditions" link points to `/` (login), not a real terms page.

## Accessibility

- `Input` renders `useId()` but no `<label>` — fields are only identifiable by `placeholder`
  (disappears on input, not announced consistently). Add a `<label>` (visible or visually
  hidden) tied to the generated `id`.
- Password inputs have no show/hide toggle.

## Minor / cleanup

- Path style is inconsistent: pages call `"auth/login"` (no leading slash), the interceptor
  uses `"/auth/refresh"`. Both resolve the same under `baseURL: "/"`, but pick one.
- `AuthLayout` forwards `slideCount` / `activeSlide` that no page passes — `SliderDots` is
  always the default 3 dots, first active. Either wire a real carousel or drop the props.
- `public/icons.svg` sprite sheet is unused.
- `src/assets/{react,vite}.svg` and `hero.png` — leftover template assets, check if still used.
- Frontend `typescript ~6` vs backend `7` — independent packages, harmless, just note it.
