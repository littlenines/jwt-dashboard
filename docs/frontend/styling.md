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
| `abstracts/`  | `_variables.scss`          | **design tokens** — colors, spacing, breakpoints, font sizes, radii |
|               | `_functions.scss`          | `rem($px)` — converts px to rem against a 10px base |
|               | `_mixins.scss`             | `respond-up($bp)`, `flex-center($dir)`, the `doughnut-*` gradient mixins |
| `base/`       | `_reset.scss`              | box‑sizing, margin/padding zero, sensible element defaults. Sets `html { font-size: 62.5% }` so **`1rem` = `10px`** |
|               | `_typography.scss`         | Montserrat font stack, base size/color, heading weights |
| `pages/`      | `_login.scss`              | `.login-wrapper`, `.login_form` |
| `themes/`     | `_default.scss`            | exposes a few tokens as CSS custom properties on `:root` (`--color-primary`, `--color-text`, …) for potential runtime theming |
| `layout/`, `vendors/` | —                  | empty placeholders, kept for the 7‑1 shape |

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

## The `rem` scale

`_reset.scss` sets `html { font-size: 62.5% }` → the browser's default 16px becomes 10px, so
`1.6rem` = 16px, `2rem` = 20px, etc. All sizes in `_variables.scss` follow this (`$font-size-base:
1.6rem`). The `rem($px)` function (`_functions.scss`) does the math when you have a pixel value
from a design.
