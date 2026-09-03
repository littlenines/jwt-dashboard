const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export const ACCESS_TOKEN = {
  jwtExpiration: "15min" as const,
  maxAgeMs: 15 * MINUTE,
};

export const REFRESH_TOKEN = {
  jwtExpiration: "60d" as const,
  rememberMaxAgeMs: 60 * DAY,
  defaultMaxAgeMs: 1 * DAY,
};

export function getRefreshTokenLifetime(remember: boolean) {
  const maxAge = remember ? REFRESH_TOKEN.rememberMaxAgeMs : REFRESH_TOKEN.defaultMaxAgeMs;

  return { maxAge, expiresAt: new Date(Date.now() + maxAge) };
}
