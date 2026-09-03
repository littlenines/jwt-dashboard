import { type Response } from "express";
import { isProduction } from "#lib/env";
import { type IssuedTokens } from "./auth.types";

const baseCookie = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
};

// Keep in sync with the access-token lifetime in #lib/jwt (signToken).
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15min

export const setAuthCookies = (res: Response, tokens: IssuedTokens) => {
  res.cookie("accessToken", tokens.accessToken, {...baseCookie, maxAge: ACCESS_TOKEN_MAX_AGE});
  res.cookie("refreshToken", tokens.refreshToken, {...baseCookie, ...(tokens.remember ? { maxAge: tokens.refreshTokenMaxAge } : {})});
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", baseCookie);
  res.clearCookie("refreshToken", baseCookie);
};
