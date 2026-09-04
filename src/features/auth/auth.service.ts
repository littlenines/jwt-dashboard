import argon2 from "argon2";
import { Prisma } from "#generated/prisma/client";
import { hashToken } from "#lib/crypto";
import { verifyRefreshToken } from "#lib/jwt";
import { issueTokens } from "./auth.tokens";
import {
  findUserByEmail,
  findUserIdByEmail,
  findUserIdByUsername,
  createUser,
  createRefreshToken,
  findRefreshTokenByHash,
  deleteRefreshTokenById,
  deleteRefreshTokenByHash,
  rotateRefreshToken,
} from "./auth.repository";
import { type IssuedTokens, type RegisterConflict } from "./auth.types";

export const loginService = async (
  email: string,
  password: string,
  remember: boolean,
): Promise<IssuedTokens | null> => {
  const user = await findUserByEmail(email);

  if (!user || !(await argon2.verify(user.password, password))) return null;

  const { accessToken, refreshToken, refreshTokenMaxAge, expiresAt } = await issueTokens(user.id, remember);

  await createRefreshToken({
    hashedToken: hashToken(refreshToken),
    userId: user.id,
    remember,
    expiresAt,
  });

  return { accessToken, refreshToken, remember, refreshTokenMaxAge };
};

export const registerService = async (email: string, username: string, password: string, accept: boolean) => {
  const [emailTaken, usernameTaken] = await Promise.all([
    findUserIdByEmail(email),
    findUserIdByUsername(username),
  ]);

  if (emailTaken) return { conflict: "email" } as const satisfies RegisterConflict;
  if (usernameTaken) return { conflict: "username" } as const satisfies RegisterConflict;

  try {
    return await createUser({
      email,
      username,
      password: await argon2.hash(password),
      accept,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { conflict: "email" } as const satisfies RegisterConflict;
    }

    throw error;
  }
};

export const refreshService = async (currentRefreshToken: string): Promise<IssuedTokens | null> => {
  const payload = await verifyRefreshToken(currentRefreshToken).catch(() => null);

  if (!payload) return null;

  const stored = await findRefreshTokenByHash(hashToken(currentRefreshToken));

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await deleteRefreshTokenById(stored.id);
    return null;
  }

  const { remember } = stored;

  const { accessToken, refreshToken, refreshTokenMaxAge, expiresAt } = await issueTokens(payload.sub, remember);

  await rotateRefreshToken({
    oldId: stored.id,
    hashedToken: hashToken(refreshToken),
    userId: payload.sub,
    remember,
    expiresAt,
  });

  return { accessToken, refreshToken, remember, refreshTokenMaxAge };
};

export const logoutService = async (refreshToken: string | undefined) => {
  if (!refreshToken) return;

  await deleteRefreshTokenByHash(hashToken(refreshToken));
};
