import express from "express";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/requireAuth";
import { loginSchema, registerSchema } from "./auth.validate";
import { loginController, registerController, refreshController, meController, logoutController } from "./auth.controller";

const router = express.Router();

router.post("/login", validate(loginSchema), loginController);

router.post("/register", validate(registerSchema), registerController);

router.post("/refresh", refreshController);

router.post("/me", requireAuth, meController);

router.post("/logout", logoutController);

export default router;
