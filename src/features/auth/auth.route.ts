import express, { type Request, type Response } from "express";
import { loginController, registerController, refreshController, logoutController } from "./auth.controller";

const router = express.Router();

router.post("/login", loginController);

router.post("/register", registerController);

router.post("/refresh", refreshController);

router.post("/logout", logoutController);

export default router;
