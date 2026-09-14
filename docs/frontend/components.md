# Components

[← index](./README.md)

All function components. All presentational except `AuthLayout` (composition), `ProtectedRoute`
(reads session state), and `Navigation`/`UserFilters` (read/hold their own state — see their
sections below). Styling is via CSS Modules from `src/styles/components/` — see
[styling.md](./styling.md).

Two unrelated UI families live here: the **auth pages** (`AuthLayout` and everything under it)
and the **dashboard / admin shell** (`Navigation` down through `UserFilters`). They don't share
components or styles — the admin shell reads its own set of tokens (`$color-surface-muted`,
`$color-text-subtle`, `$sidebar-width`, …) added to `abstracts/_variables.scss` alongside the
auth ones.

## Routing

### `ProtectedRoute` — `ProtectedRoute.tsx`
The auth gate. A layout route (`<Outlet />`): `useAuth()` → `loading` renders a placeholder,
`guest` renders `<Navigate to="/" replace />`, `authed` renders the child route. UX only — the
real check is the backend `requireAuth` middleware. Details in [routing.md](./routing.md#srccomponentsprotectedroutetsx--the-gate).

## Layout / structure

### `AuthLayout` — `AuthLayout.tsx`
The page shell. A two‑column CSS grid: `<AuthPanel>` (form) on the left, `<AuthIllustration>`
on the right.

| Prop | Type | Notes |
|------|------|-------|
| `title`, `subtitle` | `string` | passed to `AuthPanel` → `AuthHeading` |
| `onSubmit?` | `SubmitEventHandler<HTMLFormElement>` | wired to the panel's `<form>` |
| `children` | `ReactNode` | the form fields |
| `footer?` | `ReactNode` | e.g. "Don't have an account? …" |
| `illustration` | `{ src, title, subtitle }` | right‑side image + captions |
| `slideCount?`, `activeSlide?` | `number` | forwarded to `SliderDots`; **currently never passed by the pages**, so it always renders the default 3 dots |

### `AuthPanel` — `AuthPanel.tsx`
`<section>` → `<AuthHeading>` + `<form onSubmit={onSubmit}>{children}</form>` + optional footer
`<p>`. The `<form>` is the only place the submit handler lives.

### `AuthHeading` — `AuthHeading.tsx`
`<h1>{title}</h1>` + `<p>{subtitle}</p>`. Fragment, no wrapper.

### `AuthIllustration` — `AuthIllustration.tsx`
`<aside>` with a media block (`<img src={src} alt="">` + `<Doughnut>`) and an info block
(title, subtitle, `<SliderDots>`). Defaults: `slideCount = 3`, `activeSlide = 0`.
`alt=""` → the image is decorative.

## Admin shell (dashboard)

### `Navigation` — `Navigation.tsx`
The `<Dashboard>` sidebar. `position: fixed; width: $sidebar-width` (not a flex/grid sibling —
see [routing.md](./routing.md#dashboardtsx) for why no wrapper element is needed).

- Header: hardcoded "Admin Panel" / "Shop Management" + a collapse button (`<div class="chevron_left">`,
  a **plain global class** from `styles/base/_icons.scss`, the one leftover non‑module style in the
  app). The button has no `onClick` — it doesn't do anything yet.
- Four `<NavLink>`s (`/dashboard`, `/activity`, `/settings`, `/analytics`), each an icon + label.
  Active styling is `&[aria-current="page"]` in the SCSS — **no `className` function on the
  `NavLink`s**, `react-router` sets `aria-current="page"` on the active one for free.
  `/activity`, `/settings`, `/analytics` have no matching `<Route>` yet (see [todo.md](./todo.md)).
- Footer: `useAuth()` for `{username}`, a hardcoded "Super Admin" role, and a `<SignOut>` button
  wired to the same `authApi.logout() → auth.clear() → navigate("/")` sequence as elsewhere.

### `Title` — `Title.tsx`
```tsx
type TitleProps = { title: string; description: string; children: ReactNode };
```
`<section>` → heading block (`title` + `description`) + `{children}` in a `justify-content:
space-between` row. Generic page-header component; `Dashboard.tsx` passes a `<Button>` as
`children` for the page's primary action ("Add User").

### `Button` — `Button.tsx`
```tsx
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode };
```
`<button type="button">{icon}{children}</button>`. Dark, admin-theme styling — **not** the same
component as `SubmitButton`: this one is `type="button"` (no implicit form submit) and generic
for admin-panel actions, `SubmitButton` is form-specific.

## Data display

### `CountCard` — `CountCard.tsx`
```tsx
type CountCardProps = { title: string; icon: ReactElement; count: string | number };
```
One stat tile: label + icon on top, big `count` below. The color comes from
`styles[title || 'total']` — **`title` must be one of `total` / `active` / `inactive` /
`suspended`**, the exact class names defined in `CountCard.module.scss`. Passing any other
string silently drops the color (no class matches). Both the icon (via `stroke="currentColor"`)
and the count number share that color class.

### `UserCountCards` — `UserCountCards.tsx`
No props. Renders the fixed set of four `<CountCard>`s (total/`<Users>`, active/`<UserCheck>`,
inactive/`<UserX>`, suspended/`<Warning>`) with **hardcoded counts** (`8, 1, 1, 1`) — not wired to
any data source yet.

## Filters

### `Search` — `Search.tsx`
```tsx
type SearchProps = InputHTMLAttributes<HTMLInputElement>;
```
`<div>` → `<MagnifyingGlass>` + `<input>`. Fully controlled from outside — pass `value` +
`onChange` like a native input. No debouncing.

### `Select` — `Select.tsx`
```tsx
type SelectOption = { label: string; value: string };            // from src/lib/select.ts
type SelectProps = { options: SelectOption[]; value: string; onChange: (value: string) => void };
```
A custom dropdown, not a native `<select>` — needed to render icons/checkmarks a native one
can't. Structure:
- `<button class="select_trigger">` — current label + `<CaretDown>`, toggles the menu.
- `<ul class="select_menu" role="listbox">` — rendered only while open; each option is its own
  `SelectOptionItem` subcomponent (defined in the same file, not exported) so its click handler
  is a named `const handleClick` closing over that option, rather than an inline arrow inside the
  `.map`. The active option gets `aria-selected` + a `<Check>` icon.

State comes from `useSelect(onChange)` ([layers.md](./layers.md#ui-hooks-not-page-hooks)); the
`findSelectedOption` lookup comes from `src/lib/select.ts`.

### `UserFilters` — `UserFilters.tsx`
No props. Holds its own `search` / `role` / `status` state and renders `<Search>` + two
`<Select>`s in a bordered toolbar row (same card look as `CountCard`, via `$radius-lg` /
`$color-border`). **Nothing consumes this state yet** — there's no user list/table in
`Dashboard.tsx` to filter, and the `role` options (`Admin`/`Manager`/`Staff`) are placeholders,
not real data. See [todo.md](./todo.md).

## Form controls

### `Input` — `Input.tsx`
```tsx
type InputProps = InputHTMLAttributes<HTMLInputElement> & { icon?: ReactElement };
```
Renders `<div class="input_container">{icon}<input id={useId()} {...props} /></div>`. All
native input props (`type`, `placeholder`, `value`, `onChange`, …) pass straight through.

> `useId()` is generated but nothing references it — there is **no `<label>`**. Fields are
> identified only by `placeholder`. See [todo.md](./todo.md) (a11y).

### `Checkbox` — `Checkbox.tsx`
```tsx
type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label?: string | ReactElement };
```
A `<label htmlFor={id}>` wrapping a visually‑hidden real `<input type="checkbox">`, a styled
`<span class="checkbox_box">` with an SVG tick, and the `label` content. `htmlFor`/`id` are
wired correctly here (unlike `Input`). Accepts `checked` / `onChange` via `...props`.

### `SubmitButton` — `SubmitButton.tsx`
`<button type="submit" {...props}>{children}</button>`, wrapped in `memo()`. Always
`type="submit"` so it triggers the enclosing `<form onSubmit>`.

## Decorative

### `SliderDots` — `SliderDots.tsx`
`{ count, active }` → a row of `count` `<span>`s; index `=== active` gets the `_active` class.
Carousel indicator with no carousel behind it yet.

### `Doughnut` — `Doughnut.tsx`
A single `<div class="doughnut">`. Pure decoration; the gradient rings come from the
`doughnut-*` SCSS mixins ([styling.md](./styling.md)).

## Icons — `components/icons/`

Every icon is a function component returning an inline `<svg {...props}>` typed
`SVGProps<SVGSVGElement>`, so callers can pass `className`, `width`, `style`, etc. — props spread
last, so they always win over the component's own defaults.

Two visual families, matching the two component families above:

| Family | Icons | Style |
|--------|-------|-------|
| Auth forms | `Envelope`, `Person`, `ShieldSlash` | **filled**, `viewBox 0 0 30 30`, color baked into the path (`#2D31A6` at low opacity) — used as the `icon` prop of `<Input>` |
| Admin shell | `Users`, `Activity`, `Gear`, `ChartBar`, `SignOut` (nav) · `Plus` (buttons) · `MagnifyingGlass`, `CaretDown`, `Check` (search/select) · `UserCheck`, `UserX`, `Warning` (stat cards) | **stroke**, `viewBox 0 0 24 24`, `stroke="currentColor"` so they inherit the surrounding text/theme color — no baked-in color |

`public/icons.svg` is a separate sprite sheet that isn't wired up.
