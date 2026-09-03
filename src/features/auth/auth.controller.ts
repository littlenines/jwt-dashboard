import { Prisma } from "#generated/prisma/client";
import { type Request, type Response } from "express";
import {
  loginService,
  registerService,
  logoutService,
  refreshService,
} from "./auth.service";

const isProduction = process.env.APP_ENV === "production";

const baseCookie = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password, remember } = req.body;

  try {
    const result = await loginService(email, password, !!remember);

    if (!result) return res.status(400).json({ message: "Invalid email or password" });

    res.cookie("accessToken", result.accessToken, {
      ...baseCookie,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      ...baseCookie,
      ...(remember ? { maxAge: result.refreshTokenMaxAge } : {}),
    });

    return res.status(200).json({ message: "Logged in" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};

export const registerController = async (req: Request, res: Response) => {
  const { email, username, password, confirmPassword, accept } = req.body;

  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

  if (!accept) return res.status(400).json({ message: "You need to accept terms and conditions." });

  try {
    const user = await registerService(email, username, password, !!accept);

    return res.status(201).json({ user });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ message: "Email or username already in use" });
    }

    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};

export const refreshController = async (req: Request, res: Response) => {
  const currentRefreshToken = req.cookies?.refreshToken;

  if (!currentRefreshToken) return res.status(401).json({ message: "No refresh token." });

  try {
    const { accessToken, refreshToken, remember, refreshTokenMaxAge } = await refreshService(currentRefreshToken);

    res.cookie("accessToken", accessToken, {
      ...baseCookie,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...baseCookie,
      ...(remember ? { maxAge: refreshTokenMaxAge } : {}),
    });

    return res.status(200).json({ message: "Refreshed" });
  } catch {
    res.clearCookie("accessToken", baseCookie);
    res.clearCookie("refreshToken", baseCookie);

    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  await logoutService(req.cookies?.refreshToken);

  res.clearCookie("accessToken", baseCookie);
  res.clearCookie("refreshToken", baseCookie);

  return res.status(200).json({ message: "Logged out" });
};
