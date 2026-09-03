import * as z from "zod";

export const loginSchema = z.object({
  email: z.email().toLowerCase().trim(),
  password: z.string().min(1),
  remember: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
    email: z.email().toLowerCase().trim(),
    username: z.string().trim().min(3).max(30),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
    accept: z.literal(true),
  })
  .refine((regData) => regData.password === regData.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
