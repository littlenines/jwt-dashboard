import { prisma } from "#lib/prisma";
import argon2 from "argon2";
import { Prisma } from "#generated/prisma/client";
import { hashToken } from "#lib/crypto";
import { verifyRefreshToken } from "#lib/jwt";
import { issueTokens } from "./auth.tokens";
import { type IssuedTokens, type RegisterConflict } from "./auth.types";

export const loginService = async (
  email: string,
  password: string,
  remember: boolean,
): Promise<IssuedTokens | null> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await argon2.verify(user.password, password))) return null;

  const { accessToken, refreshToken, refreshTokenMaxAge, expiresAt } = await issueTokens(user.id, remember);

  await prisma.refreshToken.create({
    data: {
      hashedToken: hashToken(refreshToken),
      userId: user.id,
      remember,
      expiresAt,
    },
  });

  return { accessToken, refreshToken, remember, refreshTokenMaxAge };
};

export const registerService = async (email: string, username: string, password: string, accept: boolean) => {
  const [emailTaken, usernameTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
  ]);

  if (emailTaken) return { conflict: "email" } as const satisfies RegisterConflict;
  if (usernameTaken) return { conflict: "username" } as const satisfies RegisterConflict;

  try {
    return await prisma.user.create({
      data: {
        email,
        username,
        password: await argon2.hash(password),
        accept,
      },
      omit: {
        password: true,
        accept: true,
        updatedAt: true,
      },
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

  const stored = await prisma.refreshToken.findUnique({where: { hashedToken: hashToken(currentRefreshToken) }});

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    return null;
  }

  const { remember } = stored;

  const { accessToken, refreshToken, refreshTokenMaxAge, expiresAt } = await issueTokens(payload.sub, remember);

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: {
        hashedToken: hashToken(refreshToken),
        userId: payload.sub,
        remember,
        expiresAt,
      },
    }),
  ]);

  return { accessToken, refreshToken, remember, refreshTokenMaxAge };
};

export const logoutService = async (refreshToken: string | undefined) => {
  if (!refreshToken) return;

  await prisma.refreshToken.deleteMany({where: { hashedToken: hashToken(refreshToken) }});
};
