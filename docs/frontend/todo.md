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

## Dashboard / admin shell

- **`Navigation.tsx` renders `className={styles.navigation_footer}` but
  `Navigation.module.scss` defines no `.navigation_footer` rule.** `styles.navigation_footer` is
  `undefined` at runtime, so React just drops the class — harmless today only because the footer
  `<section>` doesn't currently need any layout styling of its own, but it's a silent no-op
  waiting to become a visible bug the moment something is added to that rule elsewhere. Either
  add the rule or drop the (currently pointless) `className`.
- Sidebar links to `/activity`, `/settings`, `/analytics` with no matching `<Route>` in
  `main.tsx` — clicking them renders nothing (no 404 page either, see the existing "no 404 /
  catch-all route" item above).
- The sidebar collapse button (`chevron_left` next to "Admin Panel") has no `onClick` — it's
  purely decorative right now.
- `Navigation` hardcodes "Admin Panel" / "Shop Management" (header) and "Super Admin" (footer
  role) — only the username comes from `useAuth()`.
- `UserCountCards` has hardcoded counts (`8, 1, 1, 1`), and `UserFilters`' `role` options
  (`Admin`/`Manager`/`Staff`) are placeholders — neither is backed by a real endpoint yet. There's
  also no user list/table in `Dashboard.tsx` for `UserFilters`' search/role/status state to
  actually filter.
- `CountCard`'s `title` prop is typed as a bare `string`, but its color only resolves for exactly
  `'total' | 'active' | 'inactive' | 'suspended'` (via `styles[title]` — see
  [styling.md](./styling.md#dynamic-class-lookup-stylessomevariable)). Narrow the type so a typo
  is a compile error instead of a silently colorless card.
- `.chevron_left` (`styles/base/_icons.scss`) is the one component-ish style not done as a CSS
  Module — it's a plain global class from before the admin shell had its own styling convention.
  Worth moving into `Navigation.module.scss` if it stays a `<div>`, or replacing with a real
  `CaretLeft`/`ChevronLeft` icon component like the rest of the icon set.
