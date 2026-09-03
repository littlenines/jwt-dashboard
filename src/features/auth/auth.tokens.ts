import { signToken, signRefreshToken } from "#lib/jwt";
import { getRefreshTokenLifetime } from "#lib/refreshTokenPolicy";
import { type MintedTokens } from "./auth.types";

export const issueTokens = async (userId: string, remember: boolean): Promise<MintedTokens> => {
  const accessToken = await signToken({ sub: userId });
  const refreshToken = await signRefreshToken({ sub: userId });
  const { maxAge: refreshTokenMaxAge, expiresAt } = getRefreshTokenLifetime(remember);

  return { accessToken, refreshToken, refreshTokenMaxAge, expiresAt };
};
