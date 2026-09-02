import express, { type Request, type Response } from "express";
import argon2 from "argon2";
import { prisma } from "#lib/prisma";
import {
  signToken,
  signRefreshToken,
  verifyRefreshToken,
} from "#lib/jwt";
import { hashToken } from "#lib/crypto";
import { getRefreshTokenLifetime } from "#lib/refreshTokenPolicy";

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password, remember } = req.body;

  const findUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!findUser) return res.status(400).json({ message: "Invalid email or password" });

  try {
    const verifyPassword = await argon2.verify(findUser.password, password);
    const isProduction = process.env.APP_ENV === "PRODUCTION";

    if (verifyPassword) {
      const token = await signToken({ sub: findUser.id });
      const refreshToken = await signRefreshToken({ sub: findUser.id });

      const hashedRefreshToken = hashToken(refreshToken);

      const { maxAge: refreshTokenMaxAge, expiresAt: refreshTokenExpire } = getRefreshTokenLifetime(!!remember);

      await prisma.refreshToken.create({
        data: {
          hashedToken: hashedRefreshToken,
          userId: findUser.id,
          remember: !!remember,
          expiresAt: refreshTokenExpire,
        },
        omit: {
          hashedToken: true,
          userId: true,
          expiresAt: true
        },
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        ...(remember ? { maxAge: refreshTokenMaxAge } : {}),
      });

      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15min
      });

      return res.status(200).json({ message: "Logged in" });
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  const { email, username, password, confirmPassword, accept } = req.body;

  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

  if (!accept) return res.status(400).json({ message: "You need to accept terms and conditions." });

  try {
    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword,
        accept: accept,
      },
      omit: {
        id: true,
        password: true,
        username: true,
        accept: true,
        updatedAt: true
      },
    });
    return res.status(201).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies?.refreshToken;

  const isProduction = process.env.APP_ENV === "PRODUCTION";

  if (!tokenFromCookie) return res.status(401).json({ message: "No refresh token." });

  try {
    const verifiedRefreshToken = await verifyRefreshToken(tokenFromCookie);
    const hashedToken = hashToken(tokenFromCookie);

    const storedRefreshToken = await prisma.refreshToken.findUnique({
      where: { hashedToken },
    });

    if (!storedRefreshToken || storedRefreshToken.expiresAt < new Date()) {
      if (storedRefreshToken)
        await prisma.refreshToken.delete({
          where: { id: storedRefreshToken.id },
        });
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const accessToken = await signToken({ sub: verifiedRefreshToken.sub });
    const newRefreshToken = await signRefreshToken({
      sub: verifiedRefreshToken.sub,
    });
    const newHashedToken = hashToken(newRefreshToken);
    const { remember } = storedRefreshToken;
    const { maxAge: refreshTokenMaxAge, expiresAt: refreshTokenExpire } = getRefreshTokenLifetime(remember);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: storedRefreshToken.id } }),
      prisma.refreshToken.create({
        data: {
          hashedToken: newHashedToken,
          userId: verifiedRefreshToken.sub,
          remember,
          expiresAt: refreshTokenExpire,
        },
      }),
    ]);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15min
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      ...(remember ? { maxAge: refreshTokenMaxAge } : {}),
    });

    return res.status(200).json({ message: "Refreshed" });
  } catch {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies?.refreshToken;

  if (tokenFromCookie) await prisma.refreshToken.deleteMany({ where: { hashedToken: hashToken(tokenFromCookie) }});

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({ message: "Logged out" });
});

export default router;
