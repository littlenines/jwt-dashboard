import express from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { addUserController, statusUserController } from "./user.controller";
import { validate } from "../../middleware/validate";
import { addUserSchema } from "./user.validate";

const router = express.Router();

router.post("/add", [requireAuth, validate(addUserSchema)], addUserController);

router.get("/status", [requireAuth], statusUserController);

export default router;
