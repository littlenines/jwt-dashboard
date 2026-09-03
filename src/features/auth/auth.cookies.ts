import { type Response } from "express";
import { isProduction } from "#lib/env";
import { ACCESS_TOKEN } from "#lib/tokenPolicy";
import { type IssuedTokens } from "./auth.types";

const baseCookie = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
};

export const setAuthCookies = (res: Response, tokens: IssuedTokens) => {
  res.cookie("accessToken", tokens.accessToken, {...baseCookie, maxAge: ACCESS_TOKEN.maxAgeMs});
  res.cookie("refreshToken", tokens.refreshToken, {...baseCookie, ...(tokens.remember ? { maxAge: tokens.refreshTokenMaxAge } : {})});
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", baseCookie);
  res.clearCookie("refreshToken", baseCookie);
};
