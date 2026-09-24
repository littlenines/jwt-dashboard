import { prisma } from "#lib/prisma";

export const findUserIdByEmail = (email: string) => prisma.user.findUnique({ where: { email }, select: { id: true } });

export const findUserIdByUsername = (username: string) => prisma.user.findUnique({ where: { username }, select: { id: true } });

export const addUser = (data: {
  email: string;
  username: string;
  password: string;
  role: string;
  status: string;
  accept: boolean
}) =>
  prisma.user.create({
    data,
    omit: {
      password: true,
      accept: true,
      updatedAt: true,
    },
  });
