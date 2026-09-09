import { http } from "@/lib/http";
import type { User, LoginInput, RegisterInput } from "@/types/auth";

// Data layer: the auth endpoints, their request/response shapes, and nothing
// else. No React, no URL strings outside this file. Presentation and state
// layers call these, never `http` directly.

export const authApi = {
  login: (body: LoginInput) =>
    http.post<{ message: string }>("/auth/login", body).then((r) => r.data),

  register: (body: RegisterInput) =>
    http.post<{ user: User }>("/auth/register", body).then((r) => r.data.user),

  logout: () =>
    http.post<{ message: string }>("/auth/logout").then((r) => r.data),

  me: () =>
    http.get<{ user: User }>("/auth/me").then((r) => r.data.user),
};
