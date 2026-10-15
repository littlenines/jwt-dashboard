import { prisma } from "#lib/prisma";
import { type Prisma } from "#generated/prisma/client";
import { type UserFilters } from "./user.types";

export const findUserIdByEmail = (email: string) => prisma.user.findUnique({ where: { email }, select: { id: true } });

export const findUserIdByUsername = (username: string) => prisma.user.findUnique({ where: { username }, select: { id: true } });

export const addUser = (data: {
  email: string;
  username: string;
  password: string;
  role: string;
  status: string;
  accept: boolean;
}) =>
  prisma.user.create({
    data,
    omit: {
      password: true,
      accept: true,
      updatedAt: true,
    },
  });

export const countUsers = () => prisma.user.count();

export const countUsersByStatus = () => prisma.user.groupBy({ by: ["status"], _count: { _all: true } });

const buildUserWhere = ({ search, role, status }: UserFilters): Prisma.UserWhereInput => ({
  ...(role && { role }),
  ...(status && { status }),
  ...(search && {
    OR: [
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ],
  }),
});

export const countUsersFiltered = (filters: UserFilters) => prisma.user.count({ where: buildUserWhere(filters) });

export const getUsersByPagination = (page: number, pageSize: number, filters: UserFilters) =>
  prisma.user.findMany({
    where: buildUserWhere(filters),
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    omit: { password: true, email: true, updatedAt: true, accept: true },
  });
