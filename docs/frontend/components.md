# Components

[← index](./README.md)

All function components. All presentational except `AuthLayout` (composition), `ProtectedRoute`
(reads session state), `Navigation` (reads session state), and `UserFilters` (holds the
local, not-yet-debounced search text — see its section below). Styling is via CSS Modules from `src/styles/components/` — see
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
inactive/`<UserX>`, suspended/`<Warning>`), backed by real data — `useUserStatuses()` fetches
`GET /user/status` on mount. No loading/error UI of its own; a failed fetch is logged and the
cards just stay at `0` (see [layers.md](./layers.md#4-presentation--srchooks-srcpages-srccomponents)).

### `Table` — `Table.tsx`
```tsx
type TableColumn<T> = { key: string; header: string; render: (row: T) => ReactNode };
type TablePagination = { page: number; pageSize: number; total: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void };
type TableProps<T> = { columns: TableColumn<T>[]; data: T[]; getRowKey: (row: T) => string | number; emptyMessage?: string; pagination?: TablePagination };
```
Generic, reusable `<table>` — no title, no card, no border of its own (that's deliberately left to
the caller; see `UserTable` below). `<thead>`/`<tbody>` built from `columns`; each cell is
whatever `column.render(row)` returns, so the caller decides formatting per column (e.g. a
currency string) instead of `Table` guessing at a cell type. Renders one `emptyMessage` row
(default `"No data yet."`) spanning all columns when `data` is empty. Styling is intentionally
minimal — just `th { font-weight: 500 }` — matching what the table actually had before it was
split out; it isn't a place to add borders/padding/hover opinions that weren't there originally.
When `pagination` is passed, a `<tfoot>` row spanning all columns renders `<Pagination {...pagination} />`;
omit it and the table has no footer.

### `Pagination` — `Pagination.tsx`
```tsx
type PaginationProps = { page: number; pageSize: number; total: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void };
```
Fully controlled — owns no state. Renders a page-size `<Select>` (10 / 20 / 50 per page, matching
the backend's `pageSize` range), `"Page {page} of {totalPages}"` where
`totalPages = Math.max(1, Math.ceil(total / pageSize))` (so an empty result reads "Page 1 of 1",
not "of 0"), and Previous/Next `<Button variant="secondary">`s disabled at either end.

### `UserTable` — `UserTable.tsx`
```tsx
type UserTableProps = { data: PaginatedUsers; page: number; pageSize: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void };
```
The "Users" instance of `Table`. Presentational: `Dashboard.tsx` passes in the data and paging
from its single `useUserPagination()` call. Defines the 5 columns over `UserListItem`
(User/Role/Status/Created/Last Login — dates via `dateFormat`, a missing `lastLoginAt` shows `—`),
forwards paging as `<Table pagination={...}>`, and wraps it in its own card
(`<section class="user_table">` + a `<div class="user_table_info">` heading showing
`Users ({data.total})`). That `total` is the **filtered** count from the backend, so the heading
reflects the current search/role/status. The card/heading styling stayed here rather than moving
to `Table` when `Table` was extracted.

## Filters

### `Search` — `Search.tsx`
```tsx
type SearchProps = InputHTMLAttributes<HTMLInputElement>;
```
`<div>` → `<MagnifyingGlass>` + `<input>`. Fully controlled from outside — pass `value` +
`onChange` like a native input. No debouncing of its own — `<UserFilters>` debounces around it.

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

State comes from `useSelect(onChange)` ([layers.md](./layers.md#ui-hooks-not-page-hooks)) —
open/close, a fixed‑position `menuStyle` that flips above the trigger when there's no room
below, and overlay registration so an open `<Select>` inside `<AddUserModal>`'s `<Modal>`
doesn't close the modal when you pick an option. The `findSelectedOption` lookup comes from
`src/lib/select.ts`.

### `UserFilters` — `UserFilters.tsx`
```tsx
type UserFiltersProps = {
  search?: string; role?: string; status?: string;
  onSearch: (value: string) => void; onRole: (value: string) => void; onStatus: (value: string) => void;
};
```
Renders `<Search>` + two `<Select>`s in a bordered toolbar row (same card look as `CountCard`, via
`$radius-lg` / `$color-border`). Values and callbacks come from `Dashboard.tsx`'s
`useUserPagination()`.

- **Selects**: role (`Admin`/`Manager`/`Staff`) and status (`Active`/`Inactive`/`Suspended`)
  options match the backend's `paginationSchema` enums. The "All Roles" / "All Status" option has
  value `""`, which the hook treats as "remove this filter." `value={role ?? ""}` because
  `<Select>` needs a string and an unset filter is `undefined`.
- **Search is debounced.** The input is bound to local `searchInput` state (so typing is instant),
  `useDebounce(searchInput)` lags it by 400ms, and only the debounced value is pushed up:

```tsx
const onDebouncedSearch = useEffectEvent((value: string) => {
  if (value !== (search ?? "")) onSearch(value);
});

useEffect(() => {
  onDebouncedSearch(debouncedSearch);
}, [debouncedSearch]);
```
  `useEffectEvent` (React 19.2) keeps the effect keyed on `debouncedSearch` alone while still
  reading the latest `search`/`onSearch` — no stale closure, no `exhaustive-deps` suppression.
  The `!==` guard skips a no-op `onSearch` on mount, which would otherwise reset `page` to `1`
  when you open a URL like `?page=3&search=john`.
- **The box follows the URL.** When `search` changes from outside (browser back/forward, a
  shared link), `searchInput` is reset to it — done **during render**, not in an effect:

```tsx
const [prevSearch, setPrevSearch] = useState(search);

if (search !== prevSearch) {
  setPrevSearch(search);
  setSearchInput(search ?? "");
}
```
  This is React's "adjust state when a prop changes" pattern: React re-renders immediately
  with the new value before painting, so there's no flash of the old text, and the
  `set-state-in-effect` lint rule stays happy. It doesn't loop with the debounce: when the
  debounced value is what changed the URL, `searchInput` already equals it, and the
  `onDebouncedSearch` `!==` guard skips the no-op push afterwards.

## Modals & overlays

### `Portal` — `Portal.tsx`
```tsx
const Portal = ({ children }: { children: ReactNode }) =>
  createPortal(children, document.body);
```
Renders `children` into `document.body` instead of wherever `<Portal>` sits in the component
tree — the standard way to escape a parent's `overflow`/`z-index`/`position` for an overlay.

### `Modal` — `Modal.tsx`
```tsx
type ModalProps = { title: string; description?: string; onClose: () => void; children: ReactNode };
```
`<Portal>` → an overlay `<div>` + a centered panel (`ref`‑tracked) with a header
(title/description + a `<Close>` button) and `{children}`. Closes via `useClickOutside(ref,
onClose)` (click outside the panel) or `useKeyDown("Escape", onClose)`. Generic — doesn't know
what's inside it; `AddUserModal` is the one current instance.

### `Field` — `Field.tsx`
```tsx
type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string };
```
A labelled `<input>` — unlike `Input` (the auth-page one), `htmlFor`/`id` are wired correctly
here via `useId()` (falls back to a passed `id` prop if given). When `type="password"`, renders
an `<Eye>`/`<EyeOff>` toggle button that flips the actual `type` between `"password"` and
`"text"` — the one input in the app with a show/hide toggle (see [todo.md](./todo.md) re: the
auth pages' password fields, which don't have this).

### `AddUserModal` — `AddUserModal.tsx`
```tsx
type AddUserModalProps = { onClose: () => void };
```
A `<Modal>` instance: form state and submission come entirely from `useAddUser(onClose)` — this
component is markup only, same pattern as the auth pages. Fields: `Field` × 4 (username, email,
password, confirm password) + `Select` × 2 (role, status — hardcoded `roleOptions`/`statusOptions`
matching the backend's `addUserSchema` enums), an `error` `<p role="alert">`, and Cancel/Create
buttons (both `disabled` while `pending`). On success, `onClose()` (passed down as `onSuccess`)
unmounts the modal — nothing refreshes `<UserCountCards>` or `<UserTable>` to reflect the new
user (see [todo.md](./todo.md)).

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
