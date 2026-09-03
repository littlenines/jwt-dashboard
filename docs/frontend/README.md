# Frontend Documentation

The client for the auth API — a React SPA with a login and a register screen. These docs
explain every file and decision, the same way [../backend/](../backend/README.md) does for the
server.

## Index

| Doc | Covers |
|-----|--------|
| [conventions.md](./conventions.md)   | Vite config, the dev proxy, `tsconfig`, the `@` alias, ESLint |
| [styling.md](./styling.md)           | The SCSS 7‑1 architecture, CSS Modules, tokens, themes, the `rem` system |
| [routing.md](./routing.md)           | `main.tsx`, React Router setup, the two pages |
| [api-client.md](./api-client.md)     | The axios instance, cookie auth, and the 401 auto‑refresh interceptor |
| [components.md](./components.md)     | Every component — props and what it renders |
| [todo.md](./todo.md)                | Known gaps (error handling, redirects, the refresh‑queue leak, a11y) |

---

## Stack

| Concern        | Choice                | Notes |
|----------------|-----------------------|-------|
| Framework      | React 19              | function components + hooks only |
| Build / dev    | Vite 8                | `@vitejs/plugin-react`, HMR |
| Routing        | `react-router` 8      | v7+ merged `react-router-dom` into `react-router` |
| HTTP           | `axios`               | one configured instance in `src/config/api.ts` |
| Styling        | Sass (SCSS)           | 7‑1 folder architecture + per‑component **CSS Modules** |
| Fonts          | `@fontsource/montserrat` | 400 / 500 / 700 imported in `main.tsx` |
| Language       | TypeScript ~6         | `erasableSyntaxOnly`, `verbatimModuleSyntax` (same rules as backend) |
| Lint           | ESLint 10 flat config | js + typescript‑eslint + react‑hooks + react‑refresh |

### Scripts (`package.json`)

| Script          | Command             | Purpose |
|-----------------|---------------------|---------|
| `pnpm dev`      | `vite`              | dev server (proxies `/auth` → backend) |
| `pnpm build`    | `tsc -b && vite build` | type‑check all project refs, then bundle to `dist/` |
| `pnpm preview`  | `vite preview`      | serve the built `dist/` locally |
| `pnpm lint`     | `eslint .`          | |

Run alongside the backend with `pnpm dev:all` **from the repo root**.

---

## Project layout

```
index.html                    Vite entry — loads /src/main.tsx into #root

src/
  main.tsx                     createRoot + StrictMode + BrowserRouter + routes + global css imports

  config/
    api.ts                     axios instance + 401 refresh interceptor

  pages/
    Login.tsx                  "/"          controlled form -> POST /auth/login
    Register.tsx               "/register"  controlled form -> POST /auth/register

  components/
    AuthLayout.tsx             page shell: <AuthPanel> + <AuthIllustration> in a 2-col grid
    AuthPanel.tsx              left side: heading + <form> + footer
    AuthHeading.tsx            <h1> + subtitle
    AuthIllustration.tsx       right side: image + <Doughnut> + text + <SliderDots>
    Input.tsx                  icon + native <input>, spreads InputHTMLAttributes
    Checkbox.tsx               custom-styled checkbox with an SVG tick
    SubmitButton.tsx           <button type="submit">, memoized
    SliderDots.tsx             row of N dots, one active
    Doughnut.tsx               decorative gradient ring
    icons/
      Envelope.tsx Person.tsx ShieldSlash.tsx   presentational SVG components

  styles/                      see styling.md
  assets/                      images imported by JS (hero.png, react.svg, vite.svg)

public/                        served as-is at "/" — favicon.svg, icons.svg,
                               two_factor.svg, register_illustration.svg
```

### Component tree (both pages)

```
<AuthLayout>                         grid: 1fr | 1fr
├── <AuthPanel>                      <section>
│   ├── <AuthHeading>                h1 + p
│   ├── <form onSubmit>
│   │   └── {children}               <Input> × n, <Checkbox>, <SubmitButton>
│   └── footer                       "Don't have an account?" etc.
└── <AuthIllustration>               <aside>
    ├── media: <img> + <Doughnut>
    └── info: title + subtitle + <SliderDots>
```

`AuthLayout` is the only "smart" structural piece; everything under it is presentational and
driven entirely by props.
