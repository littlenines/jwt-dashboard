# Frontend Documentation

The client for the auth API — a React SPA: login, register, and a protected dashboard. These
docs explain every file and decision, the same way [../backend/](../backend/README.md) does for
the server.

## Index

| Doc | Covers |
|-----|--------|
| [conventions.md](./conventions.md)   | Vite config, the dev proxy, `tsconfig`, the `@` alias, ESLint |
| [layers.md](./layers.md)             | The 4 layers: network → data → state → presentation, file by file |
| [routing.md](./routing.md)           | `main.tsx`, routes, `<ProtectedRoute>`, the pages, the auth flow |
| [styling.md](./styling.md)           | The SCSS 7‑1 architecture, CSS Modules, tokens, themes, the `rem` system |
| [components.md](./components.md)     | Every component — props and what it renders |
| [todo.md](./todo.md)                | Known gaps |

---

## Stack

| Concern        | Choice                | Notes |
|----------------|-----------------------|-------|
| Framework      | React 19              | function components + hooks only |
| Build / dev    | Vite 8                | `@vitejs/plugin-react`, HMR |
| Routing        | `react-router` 8      | v7+ merged `react-router-dom` into `react-router` |
| HTTP           | `axios`               | one configured instance in `src/lib/http.ts` |
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

## The 4 layers

API access is split so no component ever imports `axios` or knows a URL string. Mirrors the
backend's `route → controller → service → repository`.

| Layer | Job | Backend analogue | Files |
|-------|-----|------------------|-------|
| **Network** | *how* to talk to the server — base URL, credentials, the 401→refresh interceptor. No endpoint knowledge. | `lib/prisma` | `src/lib/http.ts` |
| **Data** | *which* endpoints exist + their request/response shapes. No React. | `*.repository.ts` | `src/api/auth.ts`, `src/types/auth.ts` |
| **State** | client‑side session — "am I logged in", the current user. | `*.service.ts` | `src/context/auth/` (`authContext.ts`, `AuthProvider.tsx`, `useAuth.ts`) |
| **Presentation** | components/pages — call data or state, own loading/error/render. | `*.controller.ts` | `src/pages/*`, `src/components/*` |

Full walkthrough in [layers.md](./layers.md).

---

## Project layout

```
index.html                    Vite entry — loads /src/main.tsx into #root

src/
  main.tsx                     createRoot + StrictMode + <AuthProvider> + <BrowserRouter> + routes

  lib/
    http.ts                    NETWORK: axios instance + 401 refresh interceptor
    apiError.ts                getErrorMessage(err) — axios error -> user string

  api/
    auth.ts                    DATA: authApi.login / register / logout / me

  types/
    auth.ts                    wire shapes — User, LoginInput, RegisterInput

  context/
    auth/                      STATE (one folder per context, mirrors backend features/auth/)
      authContext.ts           the React context object + AuthState / AuthContextValue types
      AuthProvider.tsx         <AuthProvider> — fetches /auth/me on mount, exposes { ...state, refetch, clear }
      useAuth.ts               the useAuth() hook

  hooks/                       PRESENTATION LOGIC (keeps pages to markup only)
    useFormSubmit.ts           shared { error, pending, run(action) } for async form submits
    useLogin.ts                login form state + submit -> authApi.login -> refetch + navigate
    useRegister.ts             register form state + submit -> authApi.register -> navigate
    useSelect.ts               open/close + selection state for <Select> (built on useClickOutside)
    useClickOutside.ts         generic "call this when a mousedown lands outside `ref`" hook

  pages/                       PRESENTATION (markup; all logic comes from a hook)
    Login.tsx                  "/"           <- useLogin()
    Register.tsx               "/register"   <- useRegister()
    Dashboard.tsx              "/dashboard"  protected; admin shell — see the dashboard tree below

  components/
    ProtectedRoute.tsx         gate: loading -> spinner, guest -> <Navigate to="/">, authed -> <Outlet/>

    // auth pages
    AuthLayout.tsx             page shell: <AuthPanel> + <AuthIllustration> in a 2-col grid
    AuthPanel.tsx  AuthHeading.tsx  AuthIllustration.tsx
    Input.tsx  Checkbox.tsx  SubmitButton.tsx  SliderDots.tsx  Doughnut.tsx

    // dashboard / admin shell
    Navigation.tsx             fixed sidebar: brand, nav links, user + sign out
    Title.tsx                  page heading (title + description) with an action slot
    Button.tsx                 generic icon + label button (admin theme, not the auth SubmitButton)
    CountCard.tsx  UserCountCards.tsx     the 4 stat cards (total/active/inactive/suspended)
    Table.tsx                  generic, reusable <table> — columns + data + getRowKey, no card/title of its own
    UserTable.tsx              the "Users" card wrapping <Table>: row type, mock data, columns
    Search.tsx                 controlled search input with a magnifying-glass icon
    Select.tsx                 controlled dropdown (options/value/onChange), checkmarks the active one
    UserFilters.tsx            composes <Search> + two <Select> into the toolbar row (not wired to <UserTable>)

    icons/                     one file per icon, all `(props: SVGProps<SVGSVGElement>) => <svg .../>`
      Envelope.tsx  Person.tsx  ShieldSlash.tsx                     — auth forms
      Users.tsx  Activity.tsx  Gear.tsx  ChartBar.tsx  SignOut.tsx  — sidebar nav
      Plus.tsx  MagnifyingGlass.tsx  CaretDown.tsx  Check.tsx       — buttons / search / select
      UserCheck.tsx  UserX.tsx  Warning.tsx                         — stat cards

  styles/                      see styling.md
  assets/                      images imported by JS

public/                        served as-is at "/" — favicon.svg, *.svg illustrations
```

### Component tree (auth pages)

```
<AuthLayout>                         grid: 1fr | 1fr
├── <AuthPanel>                      <section>
│   ├── <AuthHeading>                h1 + p
│   ├── <form onSubmit>
│   │   └── {children}               <Input> × n, <Checkbox>, error <p>, <SubmitButton>
│   └── footer
└── <AuthIllustration>               <aside>: <img> + <Doughnut> + title/subtitle + <SliderDots>
```

### Component tree (dashboard / admin shell)

```
<Navigation>                         position: fixed sidebar, $sidebar-width wide
├── header: brand + collapse button (button is currently non-functional, see todo.md)
├── <NavLink> × 4                    /dashboard, /activity, /settings, /analytics
└── footer: {username} + role + <SignOut> "Sign Out"

<main class="global_layout">         margin-left: $sidebar-width, offsets the fixed sidebar
├── <Title>                          "User Management" + description
│   └── {children}                   <Button icon={<Plus/>}>Add User</Button>
├── <UserCountCards>
│   └── <CountCard> × 4              total / active / inactive / suspended
├── <UserFilters>
│   ├── <Search>                     name/email text filter
│   ├── <Select>                     role filter
│   └── <Select>                     status filter
└── <UserTable>                      card: "Users (N)" + description
    └── <Table>                      generic — columns + mock `users` data
```

`<UserFilters>` and `<UserTable>` are independent siblings — nothing in the former filters the
latter yet (see [todo.md](./todo.md)).

`Dashboard.tsx` renders `<Navigation/>` and `<main class="global_layout">` as siblings, **not** nested in a
wrapper `<div>` — see [routing.md](./routing.md#dashboardtsx). `/activity`, `/settings`, and `/analytics`
are linked from the sidebar but have no matching `<Route>` yet (see [todo.md](./todo.md)).
