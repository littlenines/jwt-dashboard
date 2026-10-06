import { type Request, type Response } from "express";
import { type z } from "zod";
import { addUserService, getUserStatusesService, getUsersPaginationService } from "./user.service";
import { type paginationSchema } from "./user.validate";

export const addUserController = async (req: Request, res: Response) => {
  const { email, username, password, role, status } = req.body;

  const result = await addUserService(email, username, password, role, status);

  if ("conflict" in result) {
    const message = result.conflict === "email" ? "Email already registered" : "Username already taken";

    return res.status(409).json({ message });
  }

  return res.status(201).json({ user: result });
};

export const statusUserController = async (req: Request, res: Response) => {
  const result = await getUserStatusesService();

  return res.status(200).json(result);
};

export const paginationUserController = async (req: Request, res: Response) => {
  const { page, pageSize } = req.validatedQuery as z.infer<typeof paginationSchema>;

  const paginationResult = await getUsersPaginationService(page, pageSize);

  return res.status(200).json(paginationResult);
};
