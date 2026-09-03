import { type Request, type Response } from "express";
import {
  loginService,
  registerService,
  refreshService,
  logoutService,
} from "./auth.service";
import { setAuthCookies, clearAuthCookies } from "./auth.cookies";

export const loginController = async (req: Request, res: Response) => {
  const { email, password, remember } = req.body;

  const tokens = await loginService(email, password, remember);

  if (!tokens) return res.status(400).json({ message: "Invalid email or password" });

  setAuthCookies(res, tokens);

  return res.status(200).json({ message: "Logged in" });
};

export const registerController = async (req: Request, res: Response) => {
  const { email, username, password, accept } = req.body;

  const result = await registerService(email, username, password, accept);

  if ("conflict" in result) {
    const message = result.conflict === "email" ? "Email already registered" : "Username already taken";

    return res.status(409).json({ message });
  }

  return res.status(201).json({ user: result });
};

export const refreshController = async (req: Request, res: Response) => {
  const currentRefreshToken = req.cookies?.refreshToken;

  if (!currentRefreshToken) return res.status(401).json({ message: "No refresh token." });

  const tokens = await refreshService(currentRefreshToken);

  if (!tokens) {
    clearAuthCookies(res);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }

  setAuthCookies(res, tokens);

  return res.status(200).json({ message: "Refreshed" });
};

export const logoutController = async (req: Request, res: Response) => {
  clearAuthCookies(res);

  await logoutService(req.cookies?.refreshToken).catch((error) => {
    console.error(error);
  });

  return res.status(200).json({ message: "Logged out" });
};
