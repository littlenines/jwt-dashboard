import * as z from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value)

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

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(10).max(50).default(10),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  role: z.preprocess(emptyToUndefined, z.enum(["staff", "admin", "manager"]).optional()),
  status: z.preprocess(emptyToUndefined, z.enum(["active", "inactive", "suspended"]).optional()),
});