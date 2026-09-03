# Data model (`prisma/schema.prisma`)

[← index](./README.md)

## `User`

| Field         | Type       | Constraints / default        | Meaning |
|---------------|------------|------------------------------|---------|
| `id`          | `String`   | PK, `@default(uuid())`       | primary key, also the JWT `sub` claim |
| `email`       | `String`   | `@unique`                    | login identifier, stored lowercased/trimmed |
| `username`    | `String`   | `@unique`                    | public handle |
| `password`    | `String`   | —                            | **argon2 hash**, never the plaintext |
| `accept`      | `Boolean`  | `@default(false)`            | accepted terms & conditions at signup |
| `createdAt`   | `DateTime` | `@default(now())`            | |
| `updatedAt`   | `DateTime` | `@updatedAt`                 | auto‑maintained |
| `refreshTokens`| `RefreshToken[]` | relation               | all active/known refresh tokens for this user |

## `RefreshToken`

One row per issued refresh token. Lets the server **revoke** refresh tokens (logout, rotation)
even though JWTs are otherwise stateless.

| Field        | Type       | Constraints / default | Meaning |
|--------------|------------|-----------------------|---------|
| `id`         | `String`   | PK, `@default(uuid())`| |
| `hashedToken`| `String`   | `@unique`             | **sha256** of the raw refresh JWT. The raw token is never stored — a DB leak can't be replayed. |
| `userId`     | `String`   | FK → `User.id`, `onDelete: Cascade` | owner; deleting the user deletes their tokens |
| `remember`   | `Boolean`  | `@default(false)`     | was "remember me" checked — controls lifetime on rotation |
| `expiresAt`  | `DateTime` | —                     | server‑side expiry check (independent of the JWT's own `exp`) |
| `createdAt`  | `DateTime` | `@default(now())`     | |

Migrations in `prisma/migrations/` are the source of truth for the actual DB schema; run
`pnpm prisma:migrate` after editing `schema.prisma`.
