# Styling

[← index](./README.md)

Two layers working together:

1. **Global SCSS** in a [7‑1 architecture](https://sass-guidelin.es/#the-7-1-pattern) —
   resets, typography, tokens, themes. Loaded once.
2. **CSS Modules** per component — `*.module.scss`, locally scoped class names.

## Global stylesheet (`src/styles/`)

`main.tsx` imports `./styles/main.scss`, which is just a manifest:

```scss
@forward "abstracts";   // tokens, functions, mixins  (no CSS output on its own)
@forward "vendors";     // third-party overrides       (empty placeholder)
@forward "base";        // reset + base typography
@forward "layout";      // page-level layout           (empty placeholder)
@forward "pages";       // page-specific styles        -> _login.scss
@forward "themes";      // CSS custom properties        -> _default.scss
```

| Folder        | File(s)                    | Purpose |
|---------------|----------------------------|---------|
| `abstracts/`  | `_variables.scss`          | **design tokens** — colors, spacing, breakpoints, font sizes, weights, radii, shadows. Two color palettes live side by side here: the auth-page tokens (`$color-primary*`, `$color-field-*`, `$color-illustration-*`) and the admin-shell tokens (`$color-surface-muted`, `$color-text-subtle`, `$color-border`, `$color-hover`, `$color-success/warning/danger`, `$sidebar-width`) |
|               | `_functions.scss`          | `rem($px)` — converts px to rem against a 10px base |
|               | `_mixins.scss`             | `respond-up($bp)`, `flex-center($dir)`, the `doughnut-*` gradient mixins |
| `base/`       | `_reset.scss`              | box‑sizing, margin/padding zero, sensible element defaults. Sets `html { font-size: 62.5% }` so **`1rem` = `10px`** |
|               | `_typography.scss`         | Montserrat font stack, base size/color, heading weights |
|               | `_icons.scss`              | `.chevron_left` — a **plain global class**, the one leftover style not done as a CSS Module (see [components.md](./components.md#admin-shell-dashboard)) |
| `layout/`     | `_global-layout.scss`      | `.global_layout` — global (non‑module) class, `margin-left: $sidebar-width`, applied straight to `<main>` in `Dashboard.tsx` (`className="global_layout"`, no `styles.` import) so it clears the fixed `<Navigation>` sidebar. No wrapper element needed — see the sidebar note below. |
| `pages/`      | `_login.scss`              | `.login-wrapper`, `.login_form` (the only page-level partial left — `Register`'s styling moved into the `AuthLayout` component tree) |
| `themes/`     | `_default.scss`            | exposes a few tokens as CSS custom properties on `:root` (`--color-primary`, `--color-text`, …) for potential runtime theming |
| `vendors/`    | —                          | empty placeholder, kept for the 7‑1 shape |
| `components/` | one `*.module.scss` per component | see below |

### Using tokens in a partial

```scss
@use "../abstracts" as *;   // pulls in variables + functions + mixins

.thing { color: $color-primary; padding: $spacing-md; }
```

`@use ... as *` (not the deprecated `@import`) — each partial explicitly declares its deps.

## CSS Modules (`src/styles/components/*.module.scss`)

One file per component, imported as an object:

```tsx
import styles from "@/styles/components/Input.module.scss";
// ...
<div className={styles.input_container}>
```

- Class names are hashed at build → **no global collisions**, no BEM needed.
- Note the modules live under `src/styles/components/`, **not** next to the `.tsx` — a
  deliberate split (all styling under `styles/`).
- Convention here: `snake_case` class names (`auth_panel_form`, `slider_dots_dot_active`).
- Each module still does `@use "../abstracts" as *` to reach the tokens.

### Dynamic class lookup: `styles[someVariable]`

`CountCard.module.scss` defines standalone `.total` / `.active` / `.inactive` / `.suspended`
color classes (not nested under another class — nesting them would produce a compound selector
like `.count_card_count.total` that only matches when *both* classes are present, which broke
this exact case once). `CountCard.tsx` then picks one at runtime by the `title` prop:

```tsx
<span className={styles[title || 'total']}>{icon}</span>
<span className={`${styles.count_card_count} ${styles[title || 'total']}`}>{count}</span>
```

This only works because `title` is constrained to exactly those four strings — TypeScript can't
enforce that today (`CountCard`'s prop type is a bare `string`), so a typo'd or new `title` value
silently resolves to `undefined` and drops the color with no error. If more variants get added,
consider a `title: 'total' | 'active' | 'inactive' | 'suspended'` union instead of `string`.

### The fixed sidebar + `margin-left` pattern

`<Navigation>` (the dashboard sidebar) is `position: fixed; width: $sidebar-width`, taken clean
out of normal document flow. `<main class="global_layout">` just does `margin-left:
$sidebar-width` to clear it. Because neither element needs the other as a flex/grid parent to be
positioned, `Dashboard.tsx` doesn't need a wrapper `<div>` around them — they're plain siblings.
Both reference the same `$sidebar-width` token so the two numbers can't drift apart.

## The `rem` scale

`_reset.scss` sets `html { font-size: 62.5% }` → the browser's default 16px becomes 10px, so
`1.6rem` = 16px, `2rem` = 20px, etc. All sizes in `_variables.scss` follow this (`$font-size-base:
1.6rem`). The `rem($px)` function (`_functions.scss`) does the math when you have a pixel value
from a design.
