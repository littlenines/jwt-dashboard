import { type RequestHandler } from "express";
import { prisma } from "#lib/prisma";

type Role = "staff" | "admin" | "manager";

export const requireRole = (...roles: Role[]): RequestHandler => async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { role: true, status: true },
  });

  if (!user || user.status !== "active" || !roles.includes(user.role as Role)) {
    return res.status(403).json({ message: "Not permitted" });
  }

  next();
};
