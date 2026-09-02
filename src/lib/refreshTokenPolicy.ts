const REMEMBERED_MAX_AGE = 60 * 24 * 60 * 60 * 1000; // 60d
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000; // 1d

export function getRefreshTokenLifetime(remember: boolean) {
  const maxAge = remember ? REMEMBERED_MAX_AGE : DEFAULT_MAX_AGE;
  return { maxAge, expiresAt: new Date(Date.now() + maxAge) };
}
