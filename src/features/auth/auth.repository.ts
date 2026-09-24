import { prisma } from "#lib/prisma";

export const findUserByEmail = (email: string) => prisma.user.findUnique({ where: { email } });

export const findUserIdByEmail = (email: string) => prisma.user.findUnique({ where: { email }, select: { id: true } });

export const findUserIdByUsername = (username: string) => prisma.user.findUnique({ where: { username }, select: { id: true } });

export const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id }, omit: { password: true, accept: true, updatedAt: true } });

export const createUser = (data: {
  email: string;
  username: string;
  password: string;
  accept: boolean;
}) =>
  prisma.user.create({
    data,
    omit: {
      password: true,
      accept: true,
      role: true,
      status: true,
      lastLoginAt: true,
      updatedAt: true,
    },
  });

export const createRefreshToken = (data: {
  hashedToken: string;
  userId: string;
  remember: boolean;
  expiresAt: Date;
}) => prisma.refreshToken.create({ data });

export const findRefreshTokenByHash = (hashedToken: string) => prisma.refreshToken.findUnique({ where: { hashedToken } });

export const deleteRefreshTokenById = (id: string) => prisma.refreshToken.delete({ where: { id } });

export const deleteRefreshTokenByHash = (hashedToken: string) => prisma.refreshToken.deleteMany({ where: { hashedToken } });

export const rotateRefreshToken = (params: {
  oldId: string;
  hashedToken: string;
  userId: string;
  remember: boolean;
  expiresAt: Date;
}) =>
  prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: params.oldId } }),
    prisma.refreshToken.create({
      data: {
        hashedToken: params.hashedToken,
        userId: params.userId,
        remember: params.remember,
        expiresAt: params.expiresAt,
      },
    }),
  ]);

export const touchLastLogin = (id: string) => prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
