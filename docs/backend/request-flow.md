# Request flow

[← index](./README.md)

How a request travels through the app: the middleware chain, routing, and the two generic
middleware (`validate`, `errorHandler`).

## 1. `src/app.ts` — the middleware chain

```ts
dotenv.config();                 // load .env into process.env

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());               // security response headers (first)
app.use(express.json());         // parse JSON request bodies -> req.body
app.use(cookieParser());         // parse Cookie header -> req.cookies
app.use(router);                 // all application routes
app.use(errorHandler);           // central catch-all (must be last)

app.listen(PORT, ...);
```

Middleware runs **in registration order, per request**:

- `cookieParser` must come **before** `router`, or `req.cookies` is `undefined` in the handlers
  (`/auth/refresh` and `/auth/logout` depend on it).
- `errorHandler` (4‑arg signature) must come **last** — Express routes anything a handler throws
  or an async handler rejects with to it.

## 2. Routing

### `src/routes.ts`

```ts
router.use('/auth', authRouter);   // everything in auth.route.ts is under /auth
```

### `src/features/auth/auth.route.ts`

| Method & path        | Middleware                       | Controller           |
|----------------------|----------------------------------|----------------------|
| `POST /auth/login`   | `validate(loginSchema)`          | `loginController`    |
| `POST /auth/register`| `validate(registerSchema)`       | `registerController` |
| `POST /auth/refresh` | —                                | `refreshController`  |
| `POST /auth/logout`  | —                                | `logoutController`   |

A route is: **path → middleware chain → controller**. Each middleware either calls `next()` or
sends a response. `validate(...)` sends a `400` and stops the chain if the body is invalid.

## 3. `src/middleware/validate.ts` — generic body validator

```ts
validate(schema) -> (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: z.flattenError(result.error).fieldErrors });
  req.body = result.data;   // replace with parsed + defaulted + normalized data
  next();
}
```

- `safeParse` never throws — a bad body becomes a clean `400`.
- `req.body = result.data` means downstream code sees normalized values (lowercased email,
  defaulted `remember`, `confirmPassword` still present but unused).
- `fieldErrors` shape: `{ email: ["Invalid email"], password: ["Too small"] }` — good for
  rendering next to form fields.
- Reusable for any future route: `router.post("/x", validate(xSchema), xController)`.

The auth schemas themselves are in [auth.md → auth.validate.ts](./auth.md#authvalidatets--request-body-schemas).

## 4. `src/middleware/errorHandler.ts` — central error handler

```ts
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong. Please try again later." });
};
```

4‑arg `ErrorRequestHandler`, registered last in `app.ts`. Express 5 routes any unhandled throw
or async rejection from a route here. **This is why the controllers carry no `try/catch`** —
they only handle the *expected* outcomes their services report; anything else bubbles up here.
