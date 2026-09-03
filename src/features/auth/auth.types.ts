export type MintedTokens = {
  accessToken: string;
  refreshToken: string;
  refreshTokenMaxAge: number;
  expiresAt: Date;
};

export type IssuedTokens = {
  accessToken: string;
  refreshToken: string;
  remember: boolean;
  refreshTokenMaxAge: number;
};

export type RegisterConflict = { conflict: "email" | "username" };
