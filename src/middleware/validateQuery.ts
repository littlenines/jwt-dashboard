import * as z from "zod";
import type { RequestHandler } from "express";

export const validateQuery = (schema: z.ZodType): RequestHandler => (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) return res.status(400).json({ errors: z.flattenError(result.error).fieldErrors });

    req.validatedQuery = result.data;

    next();
  };
