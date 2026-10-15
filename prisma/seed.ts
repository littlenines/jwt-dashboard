import "dotenv/config";
import argon2 from "argon2";
import { prisma } from "../src/lib/prisma";

async function main() {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;

  if (!ADMIN_EMAIL || !ADMIN_USERNAME) throw new Error("ADMIN_EMAIL and ADMIN_USERNAME must be set in .env");

  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must be set in .env (min 8 characters)");

  const usernameOwner = await prisma.user.findUnique({ where: { username: ADMIN_USERNAME }, select: { email: true } });

  if (usernameOwner && usernameOwner.email !== ADMIN_EMAIL) throw new Error(`Username "${ADMIN_USERNAME}" is already taken by ${usernameOwner.email}`);

  const hashedPassword = await argon2.hash(ADMIN_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashedPassword },
    create: {
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      password: hashedPassword,
      role: "admin",
      status: "active",
      accept: true,
    },
    omit: { password: true },
  });

  console.log("Seeded admin:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
