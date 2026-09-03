import { prisma } from "#lib/prisma";
import argon2 from "argon2";
import { hashToken } from "#lib/crypto";
import { signToken, signRefreshToken, verifyRefreshToken } from "#lib/jwt";
import { getRefreshTokenLifetime } from "#lib/refreshTokenPolicy";

export const loginService = async (
  email: string,
  password: string,
  remember: boolean,
) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await argon2.verify(user.password, password))) {
    throw new Error("Invalid email or password");
  }

  const accessToken = await signToken({ sub: user.id });
  const refreshToken = await signRefreshToken({ sub: user.id });

  const { maxAge: refreshTokenMaxAge, expiresAt } = getRefreshTokenLifetime(remember);

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

export const registerService = async (email: string, username: string, password: string, accept: boolean ) => {
  const hashedPassword = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      email: email,
      username: username,
      password: hashedPassword,
      accept: accept,
    },
    omit: {
      id: true,
      password: true,
      username: true,
      accept: true,
      updatedAt: true
    },
  });

  return user;
}

export const refreshService = async (currentRefreshToken: string) => {
  const payload = await verifyRefreshToken(currentRefreshToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { hashedToken: hashToken(currentRefreshToken) },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new Error("Invalid or expired refresh token");
  }

  const { remember } = stored;

  const accessToken = await signToken({ sub: payload.sub });
  const refreshToken = await signRefreshToken({ sub: payload.sub });

  const { maxAge: refreshTokenMaxAge, expiresAt } = getRefreshTokenLifetime(remember);

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
  await prisma.refreshToken.deleteMany({
    where: { hashedToken: hashToken(refreshToken) },
  });
};
