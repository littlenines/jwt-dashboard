import express from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { addUserController } from "./user.controller";
import { validate } from "../../middleware/validate";
import { addUserSchema } from "./user.validate";

const router = express.Router();

router.post("/add", [requireAuth, validate(addUserSchema)], addUserController);

export default router;
