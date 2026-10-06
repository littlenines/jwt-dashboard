# Request flow

[← index](./README.md)

How a request travels through the app: the middleware chain, routing, and the middleware
(`validate`, `validateQuery`, `errorHandler`, `requireAuth`).

## 1. `src/app.ts` — the middleware chain

```ts
import "dotenv/config";          // FIRST import — see conventions.md "Env loading order"
// ...

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
router.use('/user', userRouter);   // everything in user.route.ts is under /user
```

### `src/features/auth/auth.route.ts`

| Method & path        | Middleware                       | Controller           |
|----------------------|----------------------------------|----------------------|
| `POST /auth/login`   | `validate(loginSchema)`          | `loginController`    |
| `POST /auth/register`| `validate(registerSchema)`       | `registerController` |
| `POST /auth/refresh` | —                                | `refreshController`  |
| `GET  /auth/me`      | `requireAuth`                    | `meController`       |
| `POST /auth/logout`  | —                                | `logoutController`   |

### `src/features/user/user.route.ts`

| Method & path        | Middleware                                       | Controller                 |
|-----------------------|---------------------------------------------------|-----------------------------|
| `POST /user/add`     | `requireAuth`, `validate(addUserSchema)`          | `addUserController`         |
| `GET  /user/status`  | `requireAuth`                                     | `statusUserController`      |
| `GET  /user/list`    | `requireAuth`, `validateQuery(paginationSchema)`  | `paginationUserController`  |

Details in [user.md](./user.md).

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

## 5. `src/middleware/requireAuth.ts` — protecting routes

```ts
export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const { sub } = await verifyToken(token); // jose also throws on expiry
    req.userId = sub;
    next();
  } catch {
    return res.status(401).json({ message: "Not authenticated" });
  }
};
```

- Reads the **access‑token cookie**, verifies it (`#lib/jwt`), and on success stamps
  `req.userId` for the controller. Missing / invalid / expired → `401`, chain stops.
- `req.userId` is typed via `src/types/express.d.ts` (`declare global { namespace Express {
  interface Request { userId?: string } } }`).
- Apply per‑route: `router.get("/me", requireAuth, meController)`. Add it to any future
  route that needs a logged‑in user.
- It does **not** try to refresh an expired access token — that's the client's job (the
  frontend axios interceptor calls `/auth/refresh` on a `401` and retries).

## 6. `src/middleware/validateQuery.ts` — query-string validation

```ts
export const validateQuery = (schema: z.ZodType): RequestHandler => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) return res.status(400).json({ errors: z.flattenError(result.error).fieldErrors });
  req.validatedQuery = result.data;
  next();
};
```

Looks like `validate`, but **cannot** reuse it — `validate` does `req.body = result.data`, and
that pattern doesn't work for query strings:

- **Express 5 made `req.query` a getter with no setter.** Reassigning it throws
  `TypeError: Cannot set property query of #<IncomingMessage> which has only a getter` at
  runtime (confirmed by testing). This is a real breaking change from Express 4, done to harden
  against prototype-pollution attacks via the query parser.
- So the validated/coerced result is stashed on a separate property, `req.validatedQuery`
  (added to `src/types/express.d.ts` alongside `req.userId`), instead.
- The handler recovers the specific type with one cast: `req.validatedQuery as
  z.infer<typeof someSchema>` — same category of "trust the middleware already ran" annotation
  as `requireAuth`'s `req.userId!`. `req.validatedQuery` has to be typed as `unknown` globally
  (the declaration applies to every route), so there's no way around a per-route annotation
  recovering the real shape.

Query values are always strings (`?page=2` → `"2"`) — schemas used with `validateQuery` need
`z.coerce.number()` (etc.), not plain `z.number()`, or every request with an actual value in
that field fails validation and only a *missing* field (falling back to `.default(...)`) passes.
