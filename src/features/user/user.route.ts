import express from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { addUserController, statusUserController, paginationUserController } from "./user.controller";
import { validate } from "../../middleware/validate";
import { validateQuery } from "../../middleware/validateQuery";
import { addUserSchema, paginationSchema } from "./user.validate";

const router = express.Router();

router.post("/add", [requireAuth, validate(addUserSchema)], addUserController);

router.get("/status", [requireAuth], statusUserController);

router.get("/list", [requireAuth, validateQuery(paginationSchema)], paginationUserController);

export default router;
