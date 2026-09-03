# Components

[← index](./README.md)

All function components. All presentational except `AuthLayout` (composition). Styling is via
CSS Modules from `src/styles/components/` — see [styling.md](./styling.md).

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

`Envelope.tsx`, `Person.tsx`, `ShieldSlash.tsx`. Each is a function component returning an
inline `<svg {...props}>` typed `SVGProps<SVGSVGElement>`, so callers can pass `className`,
`width`, etc. Colors are baked into the paths (`#2D31A6` at low opacity). Used as the `icon`
prop of `<Input>`.

`public/icons.svg` is a separate sprite sheet that isn't wired up.
