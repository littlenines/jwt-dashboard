import { SignJWT, jwtVerify } from "jose";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "#lib/tokenPolicy";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH!);

export async function signToken(payload: { sub: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN.jwtExpiration)
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { sub: string };
}

export async function signRefreshToken(payload: { sub: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN.jwtExpiration)
    .sign(refreshSecret);
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshSecret);
  return payload as { sub: string };
}
