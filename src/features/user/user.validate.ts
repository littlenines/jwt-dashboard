import * as z from "zod";

export const addUserSchema = z.object({
    email: z.email().toLowerCase().trim(),
    username: z.string().trim().min(3).max(30),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
    role: z.enum(["staff", "admin", "manager"]),
    status: z.enum(["active", "inactive", "suspended"])
  })
  .refine((regData) => regData.password === regData.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
