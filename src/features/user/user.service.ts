import argon2 from "argon2";
import { Prisma } from "#generated/prisma/client";
import { type AddUserConflict } from "./user.types";
import { findUserIdByEmail, findUserIdByUsername, addUser } from "./user.repository";

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
