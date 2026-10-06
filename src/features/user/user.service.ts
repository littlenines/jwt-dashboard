import argon2 from "argon2";
import { Prisma } from "#generated/prisma/client";
import { type AddUserConflict, type UserStatusCounts, type PaginatedUsers } from "./user.types";
import { findUserIdByEmail, findUserIdByUsername, addUser, countUsers, countUsersByStatus, getUsersByPagination } from "./user.repository";

export const addUserService = async (email: string, username: string, password: string, role: string, status: string) => {
  const [emailTaken, usernameTaken] = await Promise.all([ findUserIdByEmail(email), findUserIdByUsername(username) ]);

  if (emailTaken) return { conflict: "email" } as const satisfies AddUserConflict;
  if (usernameTaken) return { conflict: "username" } as const satisfies AddUserConflict;

  try {
    return await addUser({
      email,
      username,
      password: await argon2.hash(password),
      role,
      status,
      accept: true
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { conflict: "email" } as const satisfies AddUserConflict;
    }

    throw error;
  }
};

export const getUserStatusesService = async (): Promise<UserStatusCounts> => {
  const [total, byStatus] = await Promise.all([countUsers(), countUsersByStatus()]);
  const counts: UserStatusCounts = { total, active: 0, inactive: 0, suspended: 0 };

  for (const group of byStatus) {
    if (group.status === "active" || group.status === "inactive" || group.status === "suspended") {
      counts[group.status] = group._count._all;
    }
  }

  return counts;
};

export const getUsersPaginationService = async (page: number, pageSize: number): Promise<PaginatedUsers> => {
  const [total, users] = await Promise.all([countUsers(), getUsersByPagination(page, pageSize)]);

  return { total, users };
};
