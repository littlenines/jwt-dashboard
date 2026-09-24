import { type Request, type Response } from "express";
import { addUserService } from "./user.service";

export const addUserController = async (req: Request, res: Response) => {
  const { email, username, password, role, status } = req.body;

  const result = await addUserService(email, username, password, role, status);

  if ("conflict" in result) {
    const message = result.conflict === "email" ? "Email already registered" : "Username already taken";

    return res.status(409).json({ message });
  }

  return res.status(201).json({ user: result });
};
