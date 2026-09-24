# Conventions

[← index](./README.md)

## Vite (`vite.config.ts`)

```ts
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/user': 'http://localhost:3000',
    },
  },
});
```

### The dev proxy — why it matters

In dev, the browser only ever talks to the Vite origin (`http://localhost:5173`). A request to
a **listed** prefix is **proxied** by Vite to the backend on `:3000`; anything else is handled
by Vite itself.

Consequences:
- **Same‑origin from the browser's view** → no CORS config needed, and `Set-Cookie` /
  `withCredentials` "just work" (cross‑origin cookies would need `SameSite=None; Secure` + CORS
  `credentials`).
- The frontend calls **relative** URLs (`/auth/login`, `/user/add`), never `http://localhost:3000/...`.
- In production you deploy frontend + backend behind one origin (or add a real reverse proxy);
  the app code doesn't change.
- **Every backend route prefix needs its own entry here**, or it silently 404s in dev (Vite
  returns its own 404, not the backend's — this is why `/user/add` looked like a generic
  "Something went wrong" instead of a real API error). `vite.config.ts` isn't hot‑reloaded —
  restart `pnpm dev` after changing it. If prefixes keep multiplying, consider mounting all
  backend routes under one shared prefix (e.g. `/api/*`) so there's only ever one proxy entry.

### `@` alias

`@` → `src/`. Declared in **two** places that must agree:
- `vite.config.ts` `resolve.alias` (for the bundler / dev server)
- `tsconfig.app.json` `compilerOptions.paths` (`"@/*": ["./src/*"]`, for the type‑checker)

Used everywhere: `import Input from "@/components/Input"`.

---

## TypeScript

Three `tsconfig` files (Vite's standard project‑references setup):

| File                  | Scope | Notes |
|-----------------------|-------|-------|
| `tsconfig.json`       | root  | references only, no files of its own |
| `tsconfig.app.json`   | `src/` | the app — DOM libs, `jsx: react-jsx`, `@` paths |
| `tsconfig.node.json`  | `vite.config.ts` etc. | Node‑side tooling |

`pnpm build` runs `tsc -b` (build mode) which type‑checks every referenced project before Vite
bundles.

Key `tsconfig.app.json` options:

| Option                       | Effect |
|------------------------------|--------|
| `erasableSyntaxOnly`         | no runtime‑emitting TS syntax (no `enum`, no param properties) — same rule as the backend |
| `verbatimModuleSyntax`       | type imports must be `import { type X }` / `import type { X }` |
| `noUnusedLocals` / `noUnusedParameters` | unused bindings are errors |
| `moduleResolution: bundler`  | import `.ts`/`.tsx` without extensions |
| `noFallthroughCasesInSwitch` | every `case` must `break`/`return` |
| `jsx: react-jsx`             | no `import React` needed in components |

---

## ESLint (`eslint.config.js`)

Flat config. Applies to `**/*.{ts,tsx}`, ignores `dist/`.

| Extends | Adds |
|---------|------|
| `js.configs.recommended` | core JS rules |
| `tseslint.configs.recommended` | TypeScript rules (not type‑aware — fast) |
| `reactHooks.configs.flat.recommended` | rules‑of‑hooks + exhaustive‑deps |
| `reactRefresh.configs.vite` | warns on things that break Fast Refresh (e.g. a file exporting both a component and a non‑component) |

The frontend `README.md` (the Vite template one, not [ours](./README.md)) documents how to move
to type‑aware rules if desired.
