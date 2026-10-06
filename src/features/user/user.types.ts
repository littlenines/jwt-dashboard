import { Prisma } from "#generated/prisma/client";

export type AddUserConflict = { conflict: "email" | "username" };

export type UserStatusCounts = {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
};

export type UserListItem = Prisma.UserGetPayload<{ omit: { password: true; email: true; updatedAt: true; accept: true }; }>;

export type PaginatedUsers = {
  total: number;
  users: UserListItem[];
};
