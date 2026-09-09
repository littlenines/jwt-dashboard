import { type RequestHandler } from "express";
import { verifyToken } from "#lib/jwt";

export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = req?.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "Not authenticated" })

  try {
    const { sub } = await verifyToken(token)
    req.userId = sub;
    next();
  } catch {
    return res.status(401).json({message: "Not authenticated"})
  }
}
