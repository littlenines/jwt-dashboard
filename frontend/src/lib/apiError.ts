import { isAxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

export const getErrorMessage = (err: unknown, fallback = "Something went wrong. Please try again."): string => {
  if (isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;

    if (body?.message) return body.message;

    const firstFieldError = body?.errors && Object.values(body.errors)[0]?.[0];
    if (firstFieldError) return firstFieldError;
  }

  return fallback;
};
