import { SignJWT, jwtVerify } from "jose";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "#lib/tokenPolicy";

const encoder = new TextEncoder();
const accessSecret = () => encoder.encode(process.env.JWT_SECRET);
const refreshSecret = () => encoder.encode(process.env.JWT_REFRESH);

export async function signToken(payload: { sub: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN.jwtExpiration)
    .sign(accessSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret());
  return payload as { sub: string };
}

export async function signRefreshToken(payload: { sub: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN.jwtExpiration)
    .sign(refreshSecret());
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshSecret());
  return payload as { sub: string };
}
