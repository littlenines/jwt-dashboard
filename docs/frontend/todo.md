# Known gaps / backlog

[← index](./README.md)

## `http.ts` refresh interceptor

- **Queued promises hang on refresh failure.** Requests parked while `isRefreshing` are created
  as `new Promise((resolve) => pendingRequests.push(...))`. If `/auth/refresh` rejects, the
  `catch` clears the array but never settles those promises → they hang forever. Track `reject`
  too and reject them in the `catch`.
- **Queued retries don't set `_retry`.** A replayed request that 401s again can start a second
  refresh cycle.
- Module‑level `isRefreshing` / `pendingRequests` — shared global state; fine for one instance.

## Auth UX

- **Register errors are form‑level only.** `getErrorMessage` collapses the backend's
  `{ errors: { field: [...] } }` to the first message. No per‑field display.
- No 404 / catch‑all route.
- `ProtectedRoute`'s `loading` state renders a bare `<p>Loading…</p>` — wants a real spinner /
  skeleton.
- `refetch()` after login re‑hits `/auth/me` even though login already returned enough to know
  the user — could set the session optimistically from the login response instead.

## Routing / links

- `Register.tsx` "terms and conditions" link points to `/` (login), not a real terms page.

## Accessibility

- `Input` renders `useId()` but no `<label>` — fields are only identifiable by `placeholder`.
  Add a `<label>` (visible or visually hidden) tied to the generated `id`.
- Password inputs have no show/hide toggle.

## Minor / cleanup

- `AuthLayout` forwards `slideCount` / `activeSlide` that no page passes — `SliderDots` is
  always the default 3 dots, first active. Either wire a real carousel or drop the props.
- `public/icons.svg` sprite sheet is unused.
- `src/assets/{react,vite}.svg` and `hero.png` — leftover template assets, check if still used.
- Frontend `typescript ~6` vs backend `7` — independent packages, harmless, just note it.
