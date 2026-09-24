import { http } from "@/lib/http";
import type { AddUserInput, User } from "@/types/user";

export const userApi = {
  add: (body: AddUserInput) =>
    http.post<{ user: User }>("/user/add", body).then((r) => r.data.user),
};
